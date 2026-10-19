import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface ClanLogoProps {
  logoUrl?: string | null;
  sizeClass?: string;
  iconSizeClass?: string;
  className?: string;
}

export const ClanLogo: React.FC<ClanLogoProps> = ({
  logoUrl,
  sizeClass = 'w-9 h-9 rounded-xl',
  iconSizeClass = 'w-4 h-4',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const shieldBadge = (
    <div
      className={`${sizeClass} shrink-0 bg-white/[0.03] border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner ${className}`}
    >
      <Shield className={`${iconSizeClass} text-zinc-400`} strokeWidth={1.75} />
    </div>
  );

  if (!logoUrl || hasError) {
    return shieldBadge;
  }

  return (
    <div
      className={`${sizeClass} shrink-0 relative overflow-hidden flex items-center justify-center bg-white/[0.03] border border-white/10 shadow-inner ${className}`}
    >
      <Shield className={`${iconSizeClass} text-zinc-500 absolute`} strokeWidth={1.75} />
      <img
        src={logoUrl}
        alt=""
        onError={() => setHasError(true)}
        className="w-full h-full object-cover absolute inset-0 bg-black transition-opacity duration-200"
      />
    </div>
  );
};
