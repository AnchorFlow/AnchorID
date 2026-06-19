'use server';

import { revalidatePath } from 'next/cache';
import type { DocumentDto, DocumentType } from '@anchorid/types';
import { apiFetch, apiUpload } from '../api';
import { requireAccessToken } from '../session';

export async function listMyDocuments(): Promise<DocumentDto[]> {
  const accessToken = await requireAccessToken();
  return apiFetch<DocumentDto[]>('/documents/me', { accessToken });
}

export async function uploadDocument(type: DocumentType, file: File) {
  const accessToken = await requireAccessToken();
  const formData = new FormData();
  formData.append('type', type);
  formData.append('file', file);
  await apiUpload('/documents', formData, accessToken);
  revalidatePath('/dashboard/documents');
}
