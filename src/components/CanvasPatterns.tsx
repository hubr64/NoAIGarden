import React from 'react';

export const CanvasPatterns: React.FC = () => {
  return (
    <defs>
      {/* 1. Toiture ardoise (roof_slate) - Carrelage ardoise gris foncé */}
      <pattern id="pat-roof-slate" width="24" height="16" patternUnits="userSpaceOnUse">
        <rect width="24" height="16" fill="#242a30" />
        {/* Rangée 1 */}
        <rect x="0" y="0" width="11.5" height="7.5" rx="0.5" fill="#363f47" stroke="#181d22" strokeWidth="0.6" />
        <line x1="0.5" y1="1" x2="11" y2="1" stroke="#4c5864" strokeWidth="0.8" opacity="0.6" />
        <rect x="12" y="0" width="11.5" height="7.5" rx="0.5" fill="#303840" stroke="#181d22" strokeWidth="0.6" />
        <line x1="12.5" y1="1" x2="23" y2="1" stroke="#4c5864" strokeWidth="0.8" opacity="0.6" />
        {/* Rangée 2 (en quinconce) */}
        <rect x="-6" y="8" width="11.5" height="7.5" rx="0.5" fill="#2d353c" stroke="#181d22" strokeWidth="0.6" />
        <line x1="0" y1="9" x2="5" y2="9" stroke="#47525d" strokeWidth="0.8" opacity="0.6" />
        <rect x="6" y="8" width="11.5" height="7.5" rx="0.5" fill="#38424b" stroke="#181d22" strokeWidth="0.6" />
        <line x1="6.5" y1="9" x2="17" y2="9" stroke="#4c5864" strokeWidth="0.8" opacity="0.6" />
        <rect x="18" y="8" width="11.5" height="7.5" rx="0.5" fill="#2b3239" stroke="#181d22" strokeWidth="0.6" />
        <line x1="18.5" y1="9" x2="23.5" y2="9" stroke="#47525d" strokeWidth="0.8" opacity="0.6" />
      </pattern>

      {/* 2. Toiture tuile (roof_tile) - Carrelage tuiles terre cuite chaleureuse */}
      <pattern id="pat-roof-tile" width="20" height="16" patternUnits="userSpaceOnUse">
        <rect width="20" height="16" fill="#8f3517" />
        {/* Rangée 1 */}
        <rect x="0.5" y="0.5" width="9" height="7" rx="1.5" fill="#cb5830" stroke="#75280e" strokeWidth="0.6" />
        <line x1="1.5" y1="1.5" x2="8.5" y2="1.5" stroke="#e9794e" strokeWidth="0.8" opacity="0.7" />
        <rect x="10.5" y="0.5" width="9" height="7" rx="1.5" fill="#bf4f27" stroke="#75280e" strokeWidth="0.6" />
        <line x1="11.5" y1="1.5" x2="18.5" y2="1.5" stroke="#e9794e" strokeWidth="0.8" opacity="0.7" />
        {/* Rangée 2 (en quinconce) */}
        <rect x="-4.5" y="8.5" width="9" height="7" rx="1.5" fill="#b94821" stroke="#75280e" strokeWidth="0.6" />
        <line x1="0" y1="9.5" x2="4" y2="9.5" stroke="#e36d40" strokeWidth="0.8" opacity="0.7" />
        <rect x="5.5" y="8.5" width="9" height="7" rx="1.5" fill="#d05e35" stroke="#75280e" strokeWidth="0.6" />
        <line x1="6.5" y1="9.5" x2="13.5" y2="9.5" stroke="#ed8257" strokeWidth="0.8" opacity="0.7" />
        <rect x="15.5" y="8.5" width="9" height="7" rx="1.5" fill="#c3532b" stroke="#75280e" strokeWidth="0.6" />
        <line x1="16.5" y1="9.5" x2="19.5" y2="9.5" stroke="#e36d40" strokeWidth="0.8" opacity="0.7" />
      </pattern>

      {/* 2b. Toiture en verre (roof_glass) - Panneaux de verre translucide avec armature métallique */}
      <pattern id="pat-roof-glass" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#a0c4d3" opacity="0.7" />
        <rect x="1" y="1" width="10.5" height="10.5" rx="0.5" fill="#bce1f0" stroke="#486575" strokeWidth="0.8" opacity="0.8" />
        <line x1="2" y1="2" x2="9" y2="9" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
        <rect x="12.5" y="1" width="10.5" height="10.5" rx="0.5" fill="#aed6e7" stroke="#486575" strokeWidth="0.8" opacity="0.8" />
        <line x1="13.5" y1="2" x2="20.5" y2="9" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
        <rect x="1" y="12.5" width="10.5" height="10.5" rx="0.5" fill="#aed6e7" stroke="#486575" strokeWidth="0.8" opacity="0.8" />
        <line x1="2" y1="13.5" x2="9" y2="20.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
        <rect x="12.5" y="12.5" width="10.5" height="10.5" rx="0.5" fill="#c4e7f5" stroke="#486575" strokeWidth="0.8" opacity="0.8" />
        <line x1="13.5" y1="13.5" x2="20.5" y2="20.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
      </pattern>

      {/* 3. Herbe (grass) */}
      <pattern id="pat-grass" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#a4cb9d" />
        <path d="M4 20 L6 11 M5 20 L8 13 M16 22 L18 13 M17 22 L15 15 M10 8 L12 2 M11 8 L14 4" 
              stroke="#548658" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
      </pattern>

      {/* 4. Zone pavée (paving) */}
      <pattern id="pat-paving" width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="#e7ded3" />
        <rect x="1" y="1" width="12" height="11" rx="1.5" fill="#dad0c3" stroke="#b8aa97" strokeWidth="1" />
        <rect x="15" y="1" width="12" height="11" rx="1.5" fill="#dfd6cb" stroke="#b8aa97" strokeWidth="1" />
        <rect x="8" y="14" width="13" height="12" rx="1.5" fill="#d5cbbe" stroke="#b8aa97" strokeWidth="1" />
        <rect x="1" y="14" width="5" height="12" rx="1" fill="#dfd6cb" stroke="#b8aa97" strokeWidth="1" />
        <rect x="23" y="14" width="4" height="12" rx="1" fill="#dad0c3" stroke="#b8aa97" strokeWidth="1" />
      </pattern>

      {/* 5. Zone en terre (soil) */}
      <pattern id="pat-soil" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#a97c50" />
        <ellipse cx="6" cy="6" rx="3.5" ry="2" fill="#785028" opacity="0.45" />
        <ellipse cx="18" cy="17" rx="4" ry="2.2" fill="#6d4824" opacity="0.5" />
        <ellipse cx="16" cy="7" rx="3" ry="1.5" fill="#8f643b" opacity="0.6" />
        <ellipse cx="7" cy="18" rx="3.5" ry="1.8" fill="#785028" opacity="0.45" />
        <circle cx="12" cy="12" r="1" fill="#583818" opacity="0.4" />
      </pattern>

      {/* 6. Zone en gravier (gravel) */}
      <pattern id="pat-gravel" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#ebe4d8" />
        <circle cx="4" cy="5" r="1.4" fill="#b5a796" />
        <circle cx="14" cy="4" r="1.1" fill="#9e907e" />
        <circle cx="9" cy="10" r="1.6" fill="#c4b7a7" />
        <circle cx="16" cy="14" r="1.3" fill="#b0a290" />
        <circle cx="5" cy="16" r="1.5" fill="#a39583" />
        <circle cx="12" cy="18" r="0.9" fill="#948675" />
      </pattern>

      {/* 7. Eau (water) */}
      <pattern id="pat-water" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="#9dd6ef" />
        <path d="M2 10 Q9 6 16 10 T30 10" fill="none" stroke="#60b5de" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M4 22 Q12 18 20 22 T32 22" fill="none" stroke="#60b5de" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <circle cx="16" cy="16" r="2.5" fill="#e1f5fe" opacity="0.6" />
        <circle cx="28" cy="6" r="1.5" fill="#e1f5fe" opacity="0.5" />
      </pattern>
    </defs>
  );
};
