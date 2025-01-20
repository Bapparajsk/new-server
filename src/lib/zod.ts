import z from 'zod';

export const registerZod = z.object({
    name: z
        .string()
        .min(3, "name must be at least 3 characters")
        .regex(/^@?[a-zA-Z0-9]+$/, "name must start with an optional '@' and contain only alphanumeric characters"),
    email: z.string().email("invalid email"),
    password: z
        .string()
        .min(6, "password must be at least 6 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

export const loginZod = z.object({
    email: z.string().email("invalid email"),
    password: z.string().min(6, "password must be at least 6 characters")
})
