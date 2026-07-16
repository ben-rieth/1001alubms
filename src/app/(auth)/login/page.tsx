'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

import { Main } from '@/components/main';
import { Button } from '@/components/ui/button';
import { FieldError, FieldGroup } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { PasswordInput } from '@/components/ui/password-input';
import { authClient } from '@/lib/auth/client';
import { authErrorToFormError } from '@/lib/auth/auth-error';

const loginSchema = z.object({
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FieldName = 'email' | 'password';

// Only a malformed email routes to a field. Failed credentials come back as
// INVALID_EMAIL_OR_PASSWORD — deliberately ambiguous, so it stays form-level
// rather than revealing which half was wrong.
const FIELD_BY_ERROR_CODE: Record<string, FieldName> = {
    INVALID_EMAIL: 'email',
    INVALID_EMAIL_FORMAT: 'email',
};

const LoginPage = () => {
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        validators: {
            onChange: loginSchema,
            onSubmitAsync: async ({ value }) => {
                const { error } = await authClient.signIn.email({
                    email: value.email,
                    password: value.password,
                });

                return error
                    ? authErrorToFormError(error, FIELD_BY_ERROR_CODE)
                    : undefined;
            },
        },
        onSubmit: () => {
            router.push('/');
        },
    });

    return (
        <Main>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    form.handleSubmit();
                }}
                noValidate
                className="w-full max-w-sm rounded-3xl border border-border p-6"
            >
                <FieldGroup>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-semibold">Sign in</h1>
                        <p className="text-sm text-muted-foreground">
                            Welcome back. Enter your details to continue.
                        </p>
                    </div>

                    <form.Field name="email">
                        {(field) => (
                            <TextInput
                                field={field}
                                label="Email"
                                type="email"
                                autoComplete="email"
                                placeholder="jane@example.com"
                            />
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => (
                            <PasswordInput
                                field={field}
                                label="Password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => state.errorMap.onSubmit}
                    >
                        {(formError) =>
                            typeof formError === 'string' ? (
                                <FieldError className="text-center">
                                    {formError}
                                </FieldError>
                            ) : null
                        }
                    </form.Subscribe>

                    <form.Subscribe
                        selector={(state) => ({
                            canSubmit: state.canSubmit,
                            isSubmitting: state.isSubmitting,
                        })}
                    >
                        {({ canSubmit, isSubmitting }) => (
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="w-full"
                            >
                                {isSubmitting ? 'Signing in…' : 'Sign in'}
                            </Button>
                        )}
                    </form.Subscribe>

                    <div className="flex flex-col items-center gap-2 text-sm">
                        <p className="text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/register"
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                Create one
                            </Link>
                        </p>
                        <Link
                            href="/"
                            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                            Back to home
                        </Link>
                    </div>
                </FieldGroup>
            </form>
        </Main>
    );
};

export default LoginPage;
