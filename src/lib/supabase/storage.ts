import { createClient } from "@/lib/supabase/client";

const DEFAULT_BUCKET = "project-assets";

function extractObjectPathFromUrl(maybeUrl: string): string | null {
  // Typical Supabase public URL:
  // https://<ref>.supabase.co/storage/v1/object/public/project-assets/<object-path>
  if (!maybeUrl) return null;
  const match = maybeUrl.match(/\/project-assets\/([^?]+)(\?.*)?$/);
  return match?.[1] ?? null;
}

export async function getSignedUrl(filePath: string, bucket = DEFAULT_BUCKET): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function getSignedUrlFromAsset(asset: { file_path?: string | null; file_url: string }): Promise<string | null> {
  const path = asset.file_path ?? extractObjectPathFromUrl(asset.file_url) ?? asset.file_url;
  if (!path || path === "#") return null;
  return getSignedUrl(path);
}

