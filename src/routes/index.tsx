import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <section className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-4xl font-bold my-4">Generate</h1>
      <div className="flex flex-col items-center gap-4">
        <div>
          <Button variant="ghost">
            <Link to="/audio">
              <h2 className="text-2xl font-bold">Audio</h2>
            </Link>
          </Button>
          /
          <Button variant="ghost">
            <Link to="/video">
              <h2 className="text-2xl font-bold">Video</h2>
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Lorem ipsum dolor sit amet kasd elitr tation. Sadipscing dolor diam
          eos erat magna stet duis accusam ipsum et eum stet eos dolor nulla
          aliquyam praesent. Sed aliquyam et nulla no gubergren et nisl delenit
          diam amet dolore lorem tempor rebum.
        </p>
        <p className="text-sm text-muted-foreground">
          Lorem ipsum dolor sit amet suscipit accumsan tincidunt et invidunt
          lorem ullamcorper no. Et qui feugiat eum voluptua sit duo eirmod in et
          et sed justo adipiscing labore sed sit vulputate nibh. Amet diam
          voluptua amet ut et tempor et nulla takimata justo rebum gubergren
          feugiat esse amet takimata amet no. Sea accusam quis ea sit quis facer
          no aliquip eos et dolor clita dolore. Et justo at et diam sanctus
          nulla et at consequat. Eirmod illum luptatum sadipscing dolor dolores
          amet invidunt at consetetur amet. Sanctus kasd accusam soluta
          vulputate dolor stet rebum tempor tation sit vel minim et ex iriure
          lorem. Facilisis in consequat ad. Erat odio gubergren sea velit eos
          assum at. No nonummy diam dolor sadipscing eum sea facilisi kasd kasd
          dolor. Ipsum diam tempor tempor rebum ea erat tempor lorem feugait
          enim voluptua duis.
        </p>

        <p className="text-sm text-muted-foreground">
          Consetetur eirmod et lobortis zzril at gubergren elitr diam ex amet
          sadipscing eum tempor eum justo. Amet wisi invidunt tincidunt et
          nonumy. Sed voluptua stet kasd clita dolor kasd et justo rebum
          dolores. Volutpat te rebum tempor erat et consetetur at dolor
          tincidunt lorem sed dolor eu gubergren sit. Eirmod enim et erat.
          Labore eu dolor feugait placerat magna ipsum vero vero. Odio aliquam
          ipsum sit eleifend et. Et in sed dolor in diam lorem takimata autem
          velit dolor et. Ipsum ipsum cum ullamcorper vero. Voluptua nonumy eos
          lorem ea duo rebum duo amet takimata elitr dolores consequat tempor.
          Facilisis ipsum diam autem possim eros labore sadipscing nam dolore
          kasd esse sit nam lobortis labore invidunt dolores.
        </p>
      </div>
    </section>
  );
}
