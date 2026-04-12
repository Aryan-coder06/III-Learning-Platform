"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signInWithPopup } from "firebase/auth";
import { ArrowRight } from "lucide-react";

import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const proceed = (email: string, name?: string) => {
    const defaultName = email.split("@")[0].replace(/[._-]/g, " ");
    signIn({
      email,
      name:
        name ??
        (defaultName.length > 1
          ? defaultName.replace(/\b\w/g, (character) => character.toUpperCase())
          : "User"),
      role: "Student",
    });
    startTransition(() => router.push(nextPath));
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email) {
        proceed(user.email, user.displayName ?? undefined);
      }
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      setErrors({ google: error instanceof Error ? error.message : "An unknown error occurred" });
    } finally {
      setBusy(false);
    }
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
          Sign in with Google for instant access or enter your credentials below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button
            type="button"
            variant="dark"
            size="lg"
            className="w-full gap-3"
            onClick={handleGoogleSignIn}
            disabled={busy}
          >
            <ArrowRight className="h-5 w-5" />
            Sign in with Google
          </Button>
          
          {errors.google ? (
            <p className="text-center text-sm text-destructive">{errors.google}</p>
          ) : null}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
        </div>

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
            <Button type="submit" variant="outline" size="lg" disabled={busy}>
              {busy ? "Signing In..." : "Sign In with Email"}
            </Button>
          </div>
        </form>

        <div className="rounded-[1.5rem] border border-border/70 bg-secondary/55 p-5 text-sm leading-7 text-muted-foreground">
          New here? Google Sign-in automatically creates your account.
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
