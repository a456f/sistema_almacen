// Redimensiona una imagen en el navegador (canvas) antes de subirla.
// Por defecto: máx 1280px lado mayor, calidad JPEG 0.8.
// Reduce típicamente una foto de 5MB a ~200-400KB.
export async function resizeImageFile(
  file: File,
  maxSize = 1280,
  quality = 0.82
): Promise<File> {
  // Si ya es chico, no tocamos
  if (file.size < 400 * 1024) return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  let w = img.width, h = img.height;
  if (w > maxSize || h > maxSize) {
    if (w >= h) {
      h = Math.round((h / w) * maxSize);
      w = maxSize;
    } else {
      w = Math.round((w / h) * maxSize);
      h = maxSize;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}

export async function resizeImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => resizeImageFile(f).catch(() => f)));
}
