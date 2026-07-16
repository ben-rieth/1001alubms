type AuthError = { code?: string; message?: string };

export type FormServerErrors<TField extends string> = {
    form?: string;
    fields: Partial<Record<TField, { message: string }>>;
};

export function authErrorToFormError<TField extends string>(
    error: AuthError,
    fieldByCode: Partial<Record<string, TField>>,
): FormServerErrors<TField> {
    const message = error.message ?? 'Something went wrong. Please try again.';
    const field = error.code ? fieldByCode[error.code] : undefined;

    const fields: FormServerErrors<TField>['fields'] = {};
    if (field) {
        fields[field] = { message };
        return { fields };
    }

    return { form: message, fields };
}
