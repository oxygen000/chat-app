"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "./register-schema";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { registerUser } from "./register-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
      

    const res = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (!res.success) {
      console.error(res.message);
        toast.error("Failed to create account: " + res.message);
      return;
    }
    router.push("/login");
    toast.success("Account created successfully! Please login.");
    console.log("User created:", res.user);

  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-[380px] bg-card border border-border rounded-2xl p-6 space-y-5 shadow-lg"
    >
      {/* TITLE */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-text">Create Account 🚀</h1>
        <p className="text-sm text-text-muted">Join and start chatting</p>
      </div>

      {/* NAME */}
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              placeholder="Enter your name"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* EMAIL */}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              placeholder="Enter your email"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* PASSWORD */}
      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Password</FieldLabel>

            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* CONFIRM PASSWORD */}
      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Confirm Password</FieldLabel>

            <div className="relative">
              <Input
                {...field}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
              />

              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* BUTTON */}
      <Button
        className="w-full cursor-pointer"
        type="submit"
        disabled={form.formState.isSubmitting}
      >
        Create Account
      </Button>
      {/* FOOTER */}
      <p className="text-center text-xs text-muted-foreground">
        Do You have an account?{" "}
        <span className="text-primary cursor-pointer">
          <Link href="/login">Login</Link>
        </span>
      </p>
    </form>
  );
}
