'use client';

import { type ComponentProps, type ReactNode, useState } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type PasswordInputProps = Omit<
    ComponentProps<typeof Input>,
    'id' | 'name' | 'type' | 'value' | 'onChange' | 'onBlur'
> & {
    field: AnyFieldApi;
    label: ReactNode;
    description?: ReactNode;
    id?: string;
};

const PasswordInput = ({
    field,
    label,
    description,
    id,
    className,
    ...props
}: PasswordInputProps) => {
    const [visible, setVisible] = useState(false);

    return (
        <FormField
            field={field}
            label={label}
            description={description}
            id={id}
        >
            {({ id: inputId, invalid, describedBy }) => (
                <div className="relative">
                    <Input
                        id={inputId}
                        name={field.name}
                        type={visible ? 'text' : 'password'}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                            field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={cn('pr-10', className)}
                        {...props}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setVisible((prev) => !prev)}
                        aria-label={visible ? 'Hide password' : 'Show password'}
                        aria-pressed={visible}
                        className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full text-muted-foreground"
                    >
                        {visible ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
            )}
        </FormField>
    );
};

export { PasswordInput };
export type { PasswordInputProps };
