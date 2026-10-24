import type { Metadata } from "next";
import { AppLink } from "@/components/shared/app-link";
import { PageTransition } from "@/components/shared/transitions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <PageTransition>
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>Create a student account</h1>
          </CardTitle>
          <CardDescription>Register to submit your projects for review.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <AppLink href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </AppLink>
        </CardFooter>
      </Card>
    </PageTransition>
  );
}
