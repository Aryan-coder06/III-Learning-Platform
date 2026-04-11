"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { demoUser } from "@/lib/mock/dashboard";
import { useAuthStore } from "@/lib/auth/auth-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  const [values, setValues] = useState({
    email: demoUser.email,
    password: "studysync",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const proceed = (email: string) => {
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    signIn({
      email,
      name:
        name.length > 1
          ? name.replace(/\b\w/g, (character) => character.toUpperCase())
          : demoUser.name,
      role: demoUser.role,
    });
    startTransition(() => router.push(nextPath));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      });
      setBusy(false);
      return;
    }

    setErrors({});
    proceed(result.data.email);
    setBusy(false);
  };

  return (
    <Card className="rounded-[2rem] border-2 border-foreground/85 bg-card/95 panel-shadow">
      <CardHeader className="space-y-3 pb-5">
        <p className="section-kicker">Sign in</p>
        <CardTitle>Continue into your StudySync workspace</CardTitle>
        <CardDescription className="max-w-md text-base">
          Stage 1 uses mocked auth. The form validates on the frontend and
          redirects to the protected dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              value={values.email}
              onChange={(event) =>
                setValues((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="you@college.edu"
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Password
            </label>
            <Input
              type="password"
              value={values.password}
              onChange={(event) =>
                setValues((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Minimum 6 characters"
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" variant="dark" size="lg" disabled={busy}>
              {busy ? "Signing In..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => proceed(demoUser.email)}
            >
              Continue as Demo User
            </Button>
          </div>
        </form>

        <div className="rounded-[1.5rem] border border-border/70 bg-secondary/55 p-5 text-sm leading-7 text-muted-foreground">
          New here? Signup and team onboarding flows come in Stage 2 alongside the
          real backend API.
          <div className="mt-2">
            <Link href="/" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Back to landing page
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
