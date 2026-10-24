import type { Metadata } from "next";
import { AppLink } from "@/components/shared/app-link";
import { PageTransition } from "@/components/shared/transitions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <PageTransition>
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>Welcome back</h1>
          </CardTitle>
          <CardDescription>Sign in to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          New student?&nbsp;
          <AppLink href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Create an account
          </AppLink>
        </CardFooter>
      </Card>
    </PageTransition>
  );
}
