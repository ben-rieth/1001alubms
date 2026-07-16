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

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FieldName = 'name' | 'email' | 'password';

// Map Better Auth error codes to the field they belong to, so the message
// lands on the relevant input instead of a generic banner. Anything not
// listed here (e.g. FAILED_TO_CREATE_USER) falls back to a form-level error.
const FIELD_BY_ERROR_CODE: Record<string, FieldName> = {
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'email',
    INVALID_EMAIL: 'email',
    INVALID_EMAIL_FORMAT: 'email',
    PASSWORD_TOO_SHORT: 'password',
    PASSWORD_TOO_LONG: 'password',
    INVALID_PASSWORD: 'password',
    PASSWORD_COMPROMISED: 'password',
};

const RegisterPage = () => {
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
        validators: {
            onChange: registerSchema,
            onSubmitAsync: async ({ value }) => {
                const { error } = await authClient.signUp.email({
                    email: value.email,
                    password: value.password,
                    name: value.name,
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
                        <h1 className="text-xl font-semibold">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your details below to get started.
                        </p>
                    </div>

                    <form.Field name="name">
                        {(field) => (
                            <TextInput
                                field={field}
                                label="Name"
                                type="text"
                                autoComplete="name"
                                placeholder="Jane Doe"
                            />
                        )}
                    </form.Field>

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
                                autoComplete="new-password"
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
                                {isSubmitting
                                    ? 'Creating account…'
                                    : 'Create account'}
                            </Button>
                        )}
                    </form.Subscribe>

                    <div className="flex flex-col items-center gap-2 text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                Sign in
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

export default RegisterPage;
