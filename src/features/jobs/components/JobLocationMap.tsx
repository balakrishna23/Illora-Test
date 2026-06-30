import { MapPinIcon } from "lucide-react";

export function JobLocationMap({
  location,
  state,
  latitude,
  longitude,
}: {
  location: string;
  state: string;
  latitude: number;
  longitude: number;
}) {
  const bbox = {
    west: longitude - 0.15,
    south: latitude - 0.1,
    east: longitude + 0.15,
    north: latitude + 0.1,
  };
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west}%2C${bbox.south}%2C${bbox.east}%2C${bbox.north}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div>
      <h2 className="flex items-center gap-2 font-semibold">
        <MapPinIcon className="size-4 text-accent" aria-hidden="true" />
        Location
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {location}, {state}, Australia
      </p>
      <div className="mt-3 overflow-hidden rounded-xl border border-border">
        <iframe
          title={`Map showing ${location}, ${state}`}
          src={src}
          width="100%"
          height="220"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
