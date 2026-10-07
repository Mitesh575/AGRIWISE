import { useRef, useState } from "react";
import { Camera, FileImage, X } from "lucide-react";
import { formatBytes } from "@/lib/image";

export interface SelectedImage {
  file: File;
  previewUrl: string;
}

export function ImageUploadBox({
  label = "Upload Image",
  image,
  onSelect,
  onClear,
  error,
}: {
  label?: string;
  image: SelectedImage | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  error?: string | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {!image ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className={`flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-5 text-center transition ${
            dragOver ? "border-brand bg-brand-soft/65" : "border-brand/35 bg-brand-soft/40 hover:border-brand hover:bg-brand-soft/60"
          } ${error ? "border-danger/60 bg-danger/5" : ""}`}
        >
          <span className="grid size-14 place-items-center rounded-full bg-panel text-brand shadow-sm">
            <Camera size={24} />
          </span>
          <span className="mt-4 text-sm font-bold text-foreground">{label}</span>
          <span className="mt-1 text-xs text-muted-foreground">Drag & drop or tap to browse · JPG, PNG, WEBP · up to 10MB</span>
        </button>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand/30 bg-brand-soft/20">
          <div className="relative">
            <img src={image.previewUrl} alt="Selected crop/leaf" className="h-52 w-full object-cover" />
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove selected image"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-foreground/80 text-background backdrop-blur-sm transition hover:bg-foreground"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-panel text-brand"><FileImage size={17} /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{image.file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(image.file.size)} · ready for analysis</p>
            </div>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
