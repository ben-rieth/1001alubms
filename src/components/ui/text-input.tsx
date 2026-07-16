'use client';

import type { ComponentProps, ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

type TextInputProps = Omit<
    ComponentProps<typeof Input>,
    'id' | 'name' | 'value' | 'onChange' | 'onBlur'
> & {
    field: AnyFieldApi;
    label: ReactNode;
    description?: ReactNode;
    id?: string;
};

const TextInput = ({
    field,
    label,
    description,
    id,
    ...props
}: TextInputProps) => {
    return (
        <FormField
            field={field}
            label={label}
            description={description}
            id={id}
        >
            {({ id: inputId, invalid, describedBy }) => (
                <Input
                    id={inputId}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    {...props}
                />
            )}
        </FormField>
    );
};

export { TextInput };
export type { TextInputProps };
