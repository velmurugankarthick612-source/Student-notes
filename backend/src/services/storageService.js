const crypto = require('crypto');
const path = require('path');
const { supabase, isConfigured } = require('../config/supabase');

const BUCKET_NAME = 'resources';

/**
 * Uploads a file buffer to Supabase Storage in the structured path:
 * resources/{department}/{semester}/{subject}/{uuid}.pdf
 */
const uploadResourceFile = async (buffer, { departmentCode, semester, subjectCode, originalName, mimeType }) => {
  if (!isConfigured || !supabase) {
    throw new Error('Supabase client is not configured for storage operations.');
  }

  // Sanitize path segments
  const cleanDept = (departmentCode || 'GENERAL').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanSem = `sem-${semester || '1'}`;
  const cleanSubj = (subjectCode || 'GENERAL').replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueId = crypto.randomUUID();
  const ext = path.extname(originalName).toLowerCase() || '.pdf';
  const storagePath = `${cleanDept}/${cleanSem}/${cleanSubj}/${uniqueId}${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType: mimeType || 'application/pdf',
      upsert: false,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return {
    filePath: storagePath,
    publicUrl: publicUrlData?.publicUrl || '',
    fileName: originalName,
    fileSize: buffer.length,
    mimeType: mimeType || 'application/pdf',
  };
};

/**
 * Creates a signed download URL valid for 60 minutes
 */
const getSignedDownloadUrl = async (filePath) => {
  if (!isConfigured || !supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600); // 1 hour expiration

  if (error) {
    // If signed URL fails, fallback to public URL
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    return publicData?.publicUrl || null;
  }

  return data.signedUrl;
};

/**
 * Deletes a file from Supabase Storage
 */
const deleteResourceFile = async (filePath) => {
  if (!isConfigured || !supabase || !filePath) return false;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting file from storage:', error);
    return false;
  }

  return true;
};

module.exports = {
  uploadResourceFile,
  getSignedDownloadUrl,
  deleteResourceFile,
  BUCKET_NAME,
};
