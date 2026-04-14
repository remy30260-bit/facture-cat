"use client";
import { CapturePhoto } from '@/components/notes-frais/CapturePhoto';

export default function CapturePage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Capturer un ticket</h1>
        <p className="text-brand-gray-soft mt-1">
          Prenez une photo ou importez un fichier — Gemini extrait automatiquement les données.
        </p>
      </div>
      <CapturePhoto />
    </div>
  );
}
