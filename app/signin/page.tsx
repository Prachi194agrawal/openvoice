import { SignInButton } from "@/components/signin-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { isPreviewMode } from "@/lib/preview";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>OpenVoice IIITM</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in with your `@iiitm.ac.in` account only.</p>
        </CardHeader>
        <CardContent>
          {isPreviewMode ? (
            <Link href="/" className="block">
              <Button className="w-full">Open preview directly</Button>
            </Link>
          ) : (
            <SignInButton />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
