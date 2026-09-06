"use client";

import { type RefObject } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

const MAX_USER_IMAGE_BYTES = 8 * 1024 * 1024;
const USER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface ShopperPhoto {
  file: File;
  previewUrl: string;
}

export default function ShopperPhotoField({
  photo,
  isShared,
  inputRef,
  inputLabel,
  clearLabel,
  privateLabel,
  onPhotoChange,
  onError,
}: {
  photo: ShopperPhoto | null;
  isShared: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  inputLabel: string;
  clearLabel: string;
  privateLabel: string;
  onPhotoChange: (file: File | null) => void;
  onError: (message: string | null) => void;
}) {
  function selectPhoto(file: File | null) {
    if (!file) return;
    if (!USER_IMAGE_TYPES.has(file.type)) {
      onError("Choose a JPEG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_USER_IMAGE_BYTES) {
      onError("Choose a photo that is 8 MB or smaller.");
      return;
    }

    onError(null);
    onPhotoChange(file);
  }

  function clearPhoto() {
    if (inputRef.current) inputRef.current.value = "";
    onError(null);
    onPhotoChange(null);
  }

  return (
    <div className="demo-photo-field">
      <label className={`demo-stylist-photo${photo ? " has-photo" : ""}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label={inputLabel}
          onClick={(event) => { event.currentTarget.value = ""; }}
          onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)}
        />
        {photo ? (
          <>
            <Image src={photo.previewUrl} alt="Your selected photo" fill unoptimized sizes="320px" />
            <span>{isShared ? "Change shared photo" : "Change this photo"}</span>
          </>
        ) : (
          <span className="demo-stylist-photo-prompt">
            <span className="demo-stylist-photo-example">
              <Image
                src="/tryon-photo-example.png"
                alt="Example of one person standing front-facing with their full body visible"
                fill
                sizes="(max-width: 760px) 45vw, 140px"
              />
              <span>Example photo</span>
            </span>
            <span className="demo-stylist-photo-copy">
              <Camera size={28} aria-hidden="true" />
              <strong>Add your photo</strong>
              <small>Match this framing: one person, head to toe, facing forward</small>
            </span>
          </span>
        )}
      </label>

      {photo && (
        <div className="demo-photo-field-meta">
          <span>{isShared ? "Shared with both experiences" : privateLabel}</span>
          <button type="button" aria-label={clearLabel} onClick={clearPhoto}>Remove photo</button>
        </div>
      )}
    </div>
  );
}
