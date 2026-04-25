import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Web</CardTitle>
          <CardDescription>Shared components from `@repo/ui`.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This button comes from the reusable UI package.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button>Click me</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
