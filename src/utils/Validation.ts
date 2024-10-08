import { z } from 'zod';

//zod validation for login forms
export const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email cannot be empty" })
    .trim()
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .nonempty({ message: "Password cannot be empty" })
    .trim()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});


//zod validation for signup forms
export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .nonempty("Username is required")
    .min(3, "Username must be at least 3 characters long")
    .regex(/^[a-z]+$/, "Username must contain only small letters"),
  email: z.string().trim().nonempty("Email is required").email("Invalid email format"),
  password: z.string().trim().nonempty("Password is required").min(6, "Password must be at least 6 characters long").regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z
    .string()
    .trim()
    .nonempty("Confirm Password is required")
    .min(6, "Password must be at least 6 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

//zod validation for reset password
export const resetPasswordSchema = z.object({
  password: z.string().trim().nonempty("Password is required").min(6, "Password must be at least 6 characters long").regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z
    .string()
    .trim()
    .nonempty("Confirm Password is required")
    .min(6, "Password must be at least 6 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


//zod validation for country
export const countrySchema = z.object({
  countryName: z.string().trim().nonempty("Country name is required").regex(/^[A-Za-z]+$/, "Country name must contain only letters"),
})


//zod validation for languageSchema
export const languageSchema = z.object({
  languageName: z.string().trim().nonempty("Language name is required").regex(/^[A-Za-z]+$/, "Language name must contain only letters"),
  countries: z.array(z.string().trim().nonempty()).min(1, "At least one country must be selected"),
})


//zod validation for category
export const categorySchema = z.object({
  categoryName: z.string().trim().nonempty("Category name is required").regex(/^[A-Za-z]+$/, "Category name must contain only letters"),
})


//zod validation for lesson
export const lessonSchema = z.object({
  title: z.string().trim().nonempty("Title is required"),
  description: z.string().trim().nonempty("Description is required"),
  content: z.instanceof(File),
  languageName: z.string().trim().nonempty("At least one language must be selected"),
  categoryName: z.string().trim().nonempty("At least one category must be selected"),
});

