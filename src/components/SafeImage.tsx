import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SafeImage({ src, alt, className = '', fallbackLabel }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFE6D8] via-[#E6D9C5] to-[#D8C5A9] text-[#4E3D31] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="mb-2 text-[#B84E32]"
        >
          <path
            d="M6 30V15C6 8.37258 11.3726 3 18 3C24.6274 3 30 8.37258 30 15V30"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M12 30V16C12 12.6863 14.6863 10 18 10C21.3137 10 24 12.6863 24 16V30" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 30H33" stroke="currentColor" strokeWidth="1.75" />
        </svg>
        <span className="font-display text-sm font-medium text-[#261D17] line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
