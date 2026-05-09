"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "./login-schema";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

function getErrorMessage(code: string) {
  switch (code) {
    case "auth/user-not-found":
      return "User not found";
    case "auth/wrong-password":
      return "Wrong password";
    case "auth/invalid-email":
      return "Invalid email";
    default:
      return "Something went wrong";
  }
}

const onSubmit = async (data: LoginSchema) => {
  try {
    const response = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: "/chat",
    });

    if (response?.error) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Login Successfully");

    router.push("/chat");
  } catch (error) {
    toast.error("Something went wrong");
  }
};

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-[380px] bg-card border border-border rounded-2xl p-6 space-y-5 shadow-lg"
    >
      {/* TITLE */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-text">Welcome Back 👋</h1>
        <p className="text-sm text-text-muted">Login to continue chatting</p>
      </div>

      {/* EMAIL */}
      <div>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your email"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* PASSWORD */}
      <div>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* BUTTON */}
      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Loading..." : "Login"}
      </Button>

      {/* FOOTER */}
      <p className="text-center text-xs text-muted-foreground">
        Don’t have an account?{" "}
        <span className="text-primary cursor-pointer"><Link href="/signup">Sign up</Link></span>
      </p>
    </form>
  );
}
