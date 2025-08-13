import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="text-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Audio</CardTitle>
        </CardHeader>
        <CardContent>Auio</CardContent>
        <CardFooter>
          <Button>
            <Link to="/audio">Audio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
