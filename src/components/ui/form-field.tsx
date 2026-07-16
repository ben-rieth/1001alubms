'use client';

import { type ReactNode, useId } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
} from '@/components/ui/field';

type FormFieldRenderProps = {
    id: string;
    invalid: true | undefined;
    describedBy: string | undefined;
};

type FormFieldProps = {
    field: AnyFieldApi;
    label: ReactNode;
    description?: ReactNode;
    id?: string;
    children: (props: FormFieldRenderProps) => ReactNode;
};

const FormField = ({
    field,
    label,
    description,
    id,
    children,
}: FormFieldProps) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    // Hold errors back until the field has been blurred once (or the form was
    // submitted); after that the onChange validator keeps them live.
    const showErrors =
        field.state.meta.isBlurred || field.form.state.submissionAttempts > 0;
    const errors = showErrors ? field.state.meta.errors : [];
    const invalid = errors.length > 0 || undefined;
    const describedBy = description ? `${inputId}-description` : undefined;

    return (
        <Field data-invalid={invalid}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            {children({ id: inputId, invalid, describedBy })}
            {description && (
                <FieldDescription id={describedBy}>
                    {description}
                </FieldDescription>
            )}
            <FieldError errors={errors} />
        </Field>
    );
};

export { FormField };
export type { FormFieldProps, FormFieldRenderProps };
