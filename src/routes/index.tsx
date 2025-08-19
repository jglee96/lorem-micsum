import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <section className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🚀 Client-Side Generation
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lorem Micsum
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Generate audio and video content directly in your browser using
            FFmpeg
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle>Fast</CardTitle>
              <CardDescription>
                Generate content instantly without server requests or delays
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <CardTitle>Secure</CardTitle>
              <CardDescription>
                Your files never leave your device since everything runs locally
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <CardTitle>Simple</CardTitle>
              <CardDescription>
                Open your settings, configure options, then generate instantly
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Generation Options */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">
            What would you like to generate?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Card className="w-full max-w-sm border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-3xl">🎵</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Audio Generation</h3>
                <p className="text-muted-foreground mb-6">
                  Create silence, sine waves, and noise with various formats
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link to="/audio">Generate Audio</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="w-full max-w-sm border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-3xl">🎬</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Video Generation</h3>
                <p className="text-muted-foreground mb-6">
                  Combine images and audio to create video content
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link to="/video">Generate Video</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Configure Settings</h3>
              <p className="text-sm text-muted-foreground">
                Choose audio type, format, and parameters
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">FFmpeg Processing</h3>
              <p className="text-sm text-muted-foreground">
                FFmpeg WASM processes your request in browser
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Instant Generation</h3>
              <p className="text-sm text-muted-foreground">
                Get results immediately without servers
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Download</h3>
              <p className="text-sm text-muted-foreground">
                Download your generated files instantly
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Privacy:</span> Your files never
            leave your device since Lorem Micsum does all the work locally.
          </p>
        </div>
      </section>
    </div>
  );
}
