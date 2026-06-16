// Browser-side image optimisation: re-encode an uploaded image to WebP and
// downscale oversized photos (e.g. full-resolution phone camera shots) before
// it ever leaves the client. Keeps Storage small and pages fast on mobile,
// while preserving high visual quality. Falls back to the original file if
// the browser can't convert (older browsers, non-image files, decode errors).

export type WebpOptions = {
  /** Longest edge in pixels; larger images are scaled down to fit. */
  maxDimension?: number
  /** WebP quality, 0–1. */
  quality?: number
}

export async function toWebp(
  file: File,
  { maxDimension = 2000, quality = 0.85 }: WebpOptions = {},
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/webp') {
    // Already WebP, or not an image — nothing to do.
    return file
  }

  try {
    // `from-image` bakes in EXIF orientation so phone photos aren't sideways.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    )
    if (!blob) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp' })
  } catch {
    return file
  }
}
