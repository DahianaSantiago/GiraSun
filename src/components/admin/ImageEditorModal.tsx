"use client";

import React, { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImg } from "@/lib/image-utils";

interface ImageEditorModalProps {
  imageSrc: string;
  aspectRatio: number;
  onClose: () => void;
  onSave: (croppedBlob: Blob, altText: string) => void;
}

export default function ImageEditorModal({
  imageSrc,
  aspectRatio,
  onClose,
  onSave,
}: ImageEditorModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [altText, setAltText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        onSave(croppedBlob, altText);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="image-editor-overlay">
      <div className="image-editor-modal">
        <header className="modal-header">
          <button onClick={onClose} className="btn-icon" aria-label="Cerrar">
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <h2>Editar Imagen</h2>
          <button onClick={handleSave} disabled={isProcessing} className="btn-primary">
            {isProcessing ? "Procesando..." : "Listo"}
          </button>
        </header>

        <div className="cropper-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="modal-controls">
          <div className="control-group">
            <label>Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="zoom-range"
            />
          </div>

          <div className="control-group">
            <label htmlFor="alt-text">Texto alternativo (SEO)</label>
            <input
              id="alt-text"
              type="text"
              placeholder="Describe la imagen..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="alt-input"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .image-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .image-editor-modal {
          background: var(--bg-paper, #fdfaf6);
          width: 100%;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        @media (min-width: 768px) {
          .image-editor-modal {
            width: 90%;
            max-width: 800px;
            height: 90vh;
            border-radius: 12px;
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid var(--border-soft, #eee);
          background: var(--bg-paper, #fdfaf6);
          z-index: 10;
        }

        .modal-header h2 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin: 0;
        }

        .cropper-container {
          flex: 1;
          position: relative;
          background: #1a1a1a;
        }

        .modal-controls {
          padding: 1.5rem;
          background: var(--bg-paper, #fdfaf6);
          border-top: 1px solid var(--border-soft, #eee);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-soft);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .zoom-range {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          accent-color: var(--accent, #e6b905);
        }

        .alt-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-soft, #eee);
          border-radius: 8px;
          font-family: inherit;
          background: white;
        }

        .alt-input:focus {
          outline: 2px solid var(--accent, #e6b905);
          border-color: transparent;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-main);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .btn-icon:hover {
          background: var(--bg-soft, #f5f5f5);
        }

        .btn-primary {
          background: var(--accent, #e6b905);
          color: black;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .btn-primary:active {
          transform: scale(0.95);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
