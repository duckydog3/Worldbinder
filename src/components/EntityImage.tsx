export function EntityImage({
  url,
  alt,
  className = "h-12 w-12 rounded-full",
}: {
  url: string | null;
  alt: string;
  className?: string;
}) {
  if (!url) {
    return <div className={`shrink-0 bg-surface-raised ${className}`} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed URLs are ephemeral, not worth next/image's remote-domain config
    <img src={url} alt={alt} className={`shrink-0 object-cover ${className}`} />
  );
}
