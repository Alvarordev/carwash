"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = Readonly<{ photos?: string[] }>;

export default function PhotoGallery({ photos }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        {photos && photos.length > 0 ? (
          photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(src)}
              className="min-h-28 w-full aspect-square rounded-md overflow-hidden bg-card-alt cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img src={src} alt={`foto-${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 w-full rounded-md border border-dashed border-border flex items-center justify-center">
              <Skeleton className="h-full w-full bg-muted" />
            </div>
          ))
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background border-border">
          {selected && (
            <img src={selected} alt="foto ampliada" className="w-full h-full object-contain max-h-[80vh]" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
