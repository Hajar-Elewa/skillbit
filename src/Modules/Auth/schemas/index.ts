import z from 'zod';

export const signupSchema = z
    .object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        confirmPassword: z.string()
    })
    .required()
  export type signUpZodDto = z.infer<typeof signupSchema>;  //z.infer is a utility type that extracts the inferred type from the schema, so we can use it as the type for our DTO