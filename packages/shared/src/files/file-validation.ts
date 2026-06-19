import { createHash } from 'crypto';

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

export function isAllowedMimeType(mimeType: string): boolean {
  return (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType);
}

/** Defends against a spoofed Content-Type by sniffing the file's magic bytes. */
export function matchesMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signature = MAGIC_BYTES[mimeType];
  if (!signature) return false;
  return signature.every((byte, index) => buffer[index] === byte);
}

export function sha256Checksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function buildDocumentStorageKey(
  identityProfileId: string,
  documentId: string,
  originalFileName: string,
): string {
  const safeExt = originalFileName.includes('.')
    ? originalFileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'bin';
  return `documents/${identityProfileId}/${documentId}.${safeExt || 'bin'}`;
}
