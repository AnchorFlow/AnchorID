'use client';

import { useRef, useState } from 'react';
import { DocumentType, type DocumentType as DocumentTypeValue } from '@anchorid/types';
import { uploadDocument } from '../lib/actions/documents';

export function DocumentUploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocumentTypeValue>(DocumentType.PASSPORT);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Choose a file first');
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      await uploadDocument(type, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Document type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocumentTypeValue)}
          className="rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        >
          {Object.values(DocumentType).map((value) => (
            <option key={value} value={value}>
              {value.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">File</span>
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" />
      </label>
      <button
        type="submit"
        disabled={isUploading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {isUploading ? 'Uploading…' : 'Upload'}
      </button>
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </form>
  );
}
