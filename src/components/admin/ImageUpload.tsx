"use client";

import React, { useState, useRef, useEffect } from "react";
import { compressImage } from "@/lib/image-utils";
import ImageEditorModal from "./ImageEditorModal";
import { getClientStorage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ImageUploadProps {
  currentSrc?: string;
  currentAlt?: string;
  onImageChange: (url: string, alt: string) => void;
  onClear?: () => void;
  filterCss?: string;
  aspectRatio?: number;
  pathPrefix: string; // e.g. "cuentos"
  slug: string;
}

export default function ImageUpload({
  currentSrc,
  currentAlt,
  onImageChange,
  onClear,
  filterCss,
  aspectRatio = 6, // 6:1 as per research
  pathPrefix,
  slug,
}: ImageUploadProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(currentSrc || null);
  const [altText, setAltText] = useState(currentAlt || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up ObjectURL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage);
    };
  }, [selectedImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 1. Compress before editing to save memory and processing time
      const compressedFile = await compressImage(file);
      const objectUrl = URL.createObjectURL(compressedFile);
      setSelectedImage(objectUrl);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error processing file:", err);
      alert("Error al procesar la imagen.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCropped = async (blob: Blob, alt: string) => {
    setIsModalOpen(false);
    setIsUploading(true);
    setAltText(alt);

    try {
      // 2. Upload to Firebase Storage
      const storage = getClientStorage();
      const fileName = `hero_${Date.now()}.jpg`;
      const storagePath = `images/${pathPrefix}/${slug}/${fileName}`;
      const imageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(imageRef, blob, {
        contentType: "image/jpeg",
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);

      // 3. Update parent state
      setPreviewSrc(downloadUrl);
      onImageChange(downloadUrl, alt);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error al subir la imagen. Verifica tu conexión y los permisos de Firebase.");
    } finally {
      setIsUploading(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const triggerInput = () => {
    if (isModalOpen || isProcessing || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setPreviewSrc(null);
    setAltText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear?.();
  };

  return (
    <div className="image-upload-wrapper">
      <div
        className={`image-trigger ${!previewSrc ? "empty" : ""}`}
        style={{ aspectRatio: `${aspectRatio}/1` }}
        onClick={triggerInput}
      >
        {isUploading || isProcessing ? (
          <div className="loading-overlay">
            <span className="loader"></span>
            <small>{isUploading ? "Subiendo..." : "Procesando..."}</small>
          </div>
        ) : previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt={altText}
              className="preview-img"
              style={{ filter: filterCss ?? undefined }}
            />
            <div className="hover-overlay">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <span>Cambiar Imagen</span>
            </div>
            <button
              type="button"
              className="clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              title="Quitar imagen"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="placeholder">
            <svg
              className="placeholder-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <small>Subir imágen</small>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
        accept="image/*"
        style={{ display: "none" }}
      />

      {isModalOpen && selectedImage && (
        <ImageEditorModal
          imageSrc={selectedImage}
          aspectRatio={aspectRatio}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCropped}
        />
      )}

      <style jsx>{`
        .image-upload-wrapper {
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .image-trigger {
          width: 100%;
          position: relative;
          background: var(--bg-soft, #f5f5f5);
          border: 2px dashed var(--border-soft, #ddd);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-trigger.empty:hover {
          border-color: var(--accent, #e6b905);
          background: var(--bg-paper, #fdfaf6);
        }

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-trigger:hover .hover-overlay {
          opacity: 1;
        }

        .clear-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: 11px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
        }

        .image-trigger:hover .clear-btn {
          opacity: 1;
        }

        .placeholder {
          text-align: center;
          color: var(--text-soft, #888);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .placeholder-icon {
          width: clamp(25px, 6%, 35px);
          height: auto;
        }

        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-soft, #888);
        }

        .loader {
          width: clamp(25px, 6%, 35px);
          aspect-ratio: 1;
          border: 2px solid var(--border-soft, #ddd);
          border-bottom-color: var(--accent, #e6b905);
          border-radius: 50%;
          animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
