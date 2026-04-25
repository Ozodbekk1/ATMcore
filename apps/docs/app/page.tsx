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
          <CardTitle>Docs</CardTitle>
          <CardDescription>Shared components from `@repo/ui`.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Same card + button, reused across apps.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="secondary">Secondary</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
