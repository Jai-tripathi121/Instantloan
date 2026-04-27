"use client";
import { useState } from "react";

interface Props {
  logoUrl?: string;
  logo: string;
  color: string;
  size?: number;
  className?: string;
}

export default function BankLogo({ logoUrl, logo, color, size = 44, className = "" }: Props) {
  const [imgError, setImgError] = useState(false);

  const wh = `${size}px`;

  if (logoUrl && !imgError) {
    return (
      <div
        className={`rounded-xl flex items-center justify-center bg-white border border-gray-100 overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: wh, height: wh, minWidth: wh }}
      >
        <img
          src={logoUrl}
          alt={logo}
          style={{ width: size * 0.75, height: size * 0.75, objectFit: "contain" }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center text-white font-black flex-shrink-0 ${className}`}
      style={{ width: wh, height: wh, minWidth: wh, backgroundColor: color, fontSize: size * 0.22 }}
    >
      {logo}
    </div>
  );
}
