import { chapters, type ChapterId } from "@/lib/chapters";

export function SceneImage({ id, asset, className = "", priority = false }: { id: ChapterId; asset?: string; className?: string; priority?: boolean }) {
  const chapter = chapters.find((item) => item.id === id)!;
  const image = asset ?? chapter.image;
  const mobileImage = image === "iris-detail" ? "iris" : image;
  return (
    <picture className={`scene-picture ${className}`}>
      {!image.startsWith("memory-") && <><source media="(max-width: 767px)" srcSet={`/images/${mobileImage}-mobile.avif`} type="image/avif" />
      <source media="(max-width: 767px)" srcSet={`/images/${mobileImage}-mobile.webp`} type="image/webp" /></>}
      <source srcSet={`/images/${image}.avif`} type="image/avif" />
      {/* Art-directed assets are already resized and compressed offline. */}
      <img src={`/images/${image}.webp`} alt={asset === "iris-detail" ? "" : chapter.alt} width={1920} height={1080} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ objectPosition: chapter.focalPoint }} />
    </picture>
  );
}
