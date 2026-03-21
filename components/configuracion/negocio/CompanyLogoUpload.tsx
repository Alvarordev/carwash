"use client";

import { useRef, useState } from "react";
import { Camera, Trash } from "iconoir-react";
import { Button } from "@/components/ui/button";

type CompanyLogoUploadProps = Readonly<{
  logoUrl: string | null;
  onUpload: (file: File) => Promise<string>;
}>;

export function CompanyLogoUpload({ logoUrl, onUpload }: CompanyLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo no puede superar 2 MB");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Solo se aceptan imágenes PNG, JPG o WebP");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError("Error al subir el logo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo empresa" className="w-full h-full object-contain" />
        ) : (
          <Camera className="size-7 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Subiendo..." : logoUrl ? "Cambiar logo" : "Subir logo"}
        </Button>
        {logoUrl && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-destructive hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            <Trash className="size-3" />
            Quitar logo
          </button>
        )}
        <p className="text-xs text-muted-foreground">PNG, JPG o WebP · máx. 2 MB</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
