---
name: branch-review
description: >
    Read-only multi-perspective review of a single unmerged branch. Spawns a
    parallel reviewer panel (correctness, security, Next/React perf,
    DB/Drizzle+types), merges their findings with any existing PR review threads,
    then triages every item into actionable / nit / ambiguous and verifies the
    actionable set against the diff until only genuine human-decision items
    remain. Produces a local markdown report — never edits code, never posts to
    GitHub. Use when the user asks for "branch-review", "review my branch",
    "swarm review", or a full review of the current branch before it merges.
    Accepts an optional base branch or PR number as argument.
---

# Branch Review

Reviews the current branch against its merge base and produces a single triaged
report for the author. Runs four independent reviewer perspectives in parallel,
folds in any existing PR review threads, and keeps verifying the actionable
findings until nothing is left but the ambiguous items that need a human call.

## Hard guardrails — this skill is read-only

These are invariants, not defaults. Violating any of them is a bug in the run:

- **Never edits code.** No `Edit`, no `Write` to source, no commits, no pushes.
  The only file it writes is its own report (see Step 6).
- **Never posts to GitHub.** No comments, no reviews, no thread replies, no
  resolves, no labels. GitHub is read-only context only (`gh ... view`,
  `gh api ... GET`). If a step seems to need a write, it is out of scope —
  surface it in the report instead.
- **Never applies a fix**, even an "obvious" one. Actionable findings ship as a
  described recommendation with `file:line` and a concrete suggested change,
  for the author to apply.
- The report is the entire product. Ambiguity is escalated to the human, never
  resolved by the skill.

## Workflow

### Step 1: Establish the review target

Determine what to diff. Precedence:

1. If `$ARGUMENTS` is a base branch name, diff `HEAD` against it.
2. If `$ARGUMENTS` is a PR number/URL, resolve that PR's base branch and use
   it; also capture the PR number for thread context in Step 2.
3. Otherwise detect the current branch and its base:

```bash
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
# base: prefer an open PR's base, else main/master
gh pr view --json number,headRefName,baseRefName,url 2>/dev/null
```

If `gh pr view` returns a PR, use its `baseRefName` and store its `number`.
If there is no PR, fall back to `main` (or `master` if `main` is absent). A
missing PR is the normal pre-merge case — proceed with base-branch diffing and
skip all PR-thread steps.

Refuse to run only if `HEAD` is the base branch itself (nothing to review) —
say so and stop.

### Step 2: Gather context

Compute the merge-base diff (`...` so only this branch's changes are reviewed,
not base commits merged in):

```bash
git diff <base>...HEAD --name-only
git diff <base>...HEAD
git log <base>...HEAD --oneline
git rev-parse HEAD          # HEAD SHA, recorded in the report
```

Store: branch name, base branch, changed file list, full diff, commit log, and
HEAD SHA.

**Existing PR threads (only if a PR was found in Step 1).** Fetch unresolved,
non-outdated review threads read-only, so panel findings can be reconciled
against what reviewers already said:

```bash
gh api graphql -f query='
  query($owner:String!,$repo:String!,$pr:Int!){
    repository(owner:$owner,name:$repo){
      pullRequest(number:$pr){
        reviewThreads(first:100){ nodes {
          isResolved isOutdated
          comments(first:20){ nodes { author{login} body path line } }
        }}
      }
    }
  }' -f owner=<owner> -f repo=<repo> -F pr=<number>
```

Keep only threads where `isResolved=false` and `isOutdated=false`. For each,
note whether a **human** participated (any author that is not a bot/app). Human
participation is sticky through the whole run — see triage rules. If there is no
PR, skip this entirely; the panel findings are the only input.

### Step 3: Launch the reviewer panel (4 agents, parallel)

Launch ALL agents in a **single message** with multiple Agent tool calls so
they run in true parallel. Each agent is told it is the sole reviewer and does
not know about the others. Pass each the full diff, changed-file list, and
commit log gathered in Step 2 — tell each **"the diff is already gathered; do
not run git or gh, do not check out anything, review only the diff below."**

Pin each agent's model explicitly (review is the reasoning-heavy step; do not
inherit a cheaper caller model). If the harness rejects a model id, fall back
to `opus`.

| Agent           | `model`  | Focus                                                                                                                                                                                                                            |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| correctness     | `opus`   | Logic errors, edge cases, off-by-one, null/undefined, async races, broken data flow, error handling, regressions vs. base.                                                                                                       |
| security        | `opus`   | Authz/IDOR and tenant isolation, **better-auth** session/cookie handling, injection (SQL via Drizzle raw, XSS, command), secret/PII leakage, SSRF, unsafe redirects, missing input validation (zod).                             |
| next-react-perf | `sonnet` | Server/client component boundaries, RSC data fetching, `use client` overreach, hydration mismatches, needless re-renders, request waterfalls, caching/revalidation, bundle bloat. Apply this repo's Next/React perf conventions. |
| db-types        | `sonnet` | **Drizzle** schema/migration safety (nullability, defaults, destructive changes), query correctness, N+1, transaction boundaries, TypeScript soundness (no unsafe `any`/casts), zod schema alignment with types.                 |

Each agent must end its response with findings in this **exact** format:

```
STRUCTURED_FINDINGS:
- file: <path> | line: <number or "general"> | severity: <CRITICAL|HIGH|MEDIUM|LOW|NIT> | reviewer: <agent> | confidence: <high|medium|low> | body: <what's wrong, why it matters, and a concrete suggested fix>
...

OVERALL_SUMMARY:
<1 paragraph assessment>
```

If an agent has no findings:

```
STRUCTURED_FINDINGS:
(none)

OVERALL_SUMMARY:
<1 paragraph assessment>
```

If an agent fails to launch or returns unparseable output, note it as a skipped
reviewer in the report and continue with the rest. Even one reviewer is enough
to produce a report.

### Step 4: Merge findings and existing threads

Collect all `STRUCTURED_FINDINGS` plus each retained PR thread from Step 2 (a
thread becomes a pseudo-finding: `file`/`line` from the thread, body from its
comments).

**Deduplicate.** Items on the same `file` within 5 lines, or clearly the same
concern, merge into one. Record convergence (flagged by 2+ reviewers, or by a
reviewer _and_ an existing thread) — convergent items carry higher confidence
and should keep the highest severity of the group.

### Step 5: Triage and verify — loop until only ambiguous remain

Classify every merged item into exactly one bucket:

- **Actionable** — concrete, high-confidence defect with a single clear fix:
  CRITICAL/HIGH severity, or an unambiguous correctness/security bug, scoped to
  one file or a tightly-related set, no design decision required.
- **Nit** — style, preference, micro-optimization, speculative, or already
  handled elsewhere in the diff. Real but low-signal.
- **Ambiguous** — needs a human judgement call: architectural tradeoff, unclear
  author intent, broad/cross-cutting scope, a possible-but-uncertain bug, or
  reviewers disagreeing. **This is the only bucket that survives to demand your
  attention.**

**Existing-thread override:** any thread a **human** participated in is
**always Ambiguous** (surfaced for you), never quietly filed as nit/actionable —
this skill does not adjudicate a conversation a person is already in.

**Verification loop (this is the "keep going" part).** Actionable findings come
from agents that saw only the diff, so some are false positives. Run a verifier
agent (`model: opus`) over the current Actionable list with the full diff and
ask it, per item, to return one of:

- **confirmed** — real defect, the described fix is correct → stays Actionable.
- **refuted** — not a real defect given the surrounding code / it's already
  handled → drop it (record in the report's "Dismissed" section with the
  reason).
- **uncertain** — can't confirm from the diff alone → demote to Ambiguous.

Re-run verification **only on items whose bucket changed** in the previous
pass, since a demotion can merge/adjust neighbours. Repeat until a full pass
produces no changes — the Actionable set is now stable and everything the
verifier couldn't stand behind has become Ambiguous. Cap at **4 passes**; if
still churning, freeze and mark the unstable items Ambiguous. The end state is
the invariant the user asked for: a verified Actionable list, a collapsed Nit
list, and an Ambiguous list that is the human's to decide.

### Step 6: Write the report

Write one markdown file to `.branch-review/<branch-slugified>-<short_sha>.md`
(create the dir if needed; it is gitignored). Then print a short summary to the
terminal: counts per bucket and the path.

Report shape:

```markdown
# Branch review — <branch> → <base> @ <short_sha>

_Read-only. No code was changed and nothing was posted to GitHub._

Panel: correctness · security · next-react-perf · db-types
<note any skipped reviewers>

## Verdict: <emoji> <one line>

<2-3 sentences: overall risk and what, if anything, blocks merge>

## ⚠️ Ambiguous — needs your decision (<n>)

For each: `file:line`, the question you need to answer, the tradeoff, and the
reviewer(s)/thread it came from. These are why the skill stopped here.

## 🔧 Actionable — verified, recommended fixes (<n>)

For each: severity, `file:line`, what's wrong, why it matters, and a concrete
suggested change. Not applied — apply yourself. Mark convergent items.

## 🔹 Nits (<n>)

One line each, grouped by file. No detail expansion.

## 🗑 Dismissed by verification (<n>)

Findings the verifier refuted, with the reason — so the audit trail survives.

## Reviewer summaries

| Reviewer        | Assessment   |
| --------------- | ------------ |
| correctness     | <1 sentence> |
| security        | <1 sentence> |
| next-react-perf | <1 sentence> |
| db-types        | <1 sentence> |
```

Severity emojis: 🔴 CRITICAL · 🟠 HIGH · 🟡 MEDIUM · 🟢 LOW · ⚪ NIT.

## Graceful degradation

- **No PR:** normal pre-merge case — diff against base, skip thread steps.
- **A reviewer agent fails:** note it skipped, run the rest.
- **All agents fail:** report the failure; do not fabricate findings.
- **Verifier fails:** skip the loop, mark every Actionable item's confidence as
  unverified in the report, and note the verifier was unavailable.
- **`gh` unavailable / not authed:** skip PR context, continue with the diff.

## Reuse note

This skill is scoped to this repo because the panel encodes its stack
(Next 16 / React 19 / Drizzle / better-auth / TanStack Form / zod / Tailwind).
To reuse it across projects, copy it to `~/.claude/skills/branch-review/` and
generalize the panel's Focus column.
