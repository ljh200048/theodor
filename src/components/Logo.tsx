import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
}

export default function Logo({ className = "h-14 w-auto", size }: LogoProps) {
  return (
    <svg
      viewBox="0 0 400 320"
      className={className}
      style={size ? { height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Shield background and borders */}
      <path
        d="M 200, 10 
           Q 200, 10 300, 30
           C 310, 100 320, 195 200, 290
           C 80, 195 90, 100 100, 30
           Q 200, 10 200, 10 Z"
        fill="#FAF6F0"
        stroke="#B3937A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      
      {/* Dashed Inner Shield border */}
      <path
        d="M 200, 17 
           Q 200, 17 292, 36
           C 301, 102 310, 188 200, 281
           C 90, 188 99, 102 108, 36
           Q 200, 17 200, 17 Z"
        fill="none"
        stroke="#B3937A"
        strokeWidth="0.75"
        strokeDasharray="4 3"
      />

      {/* Curved top thick charcoal bar */}
      <path d="M 134, 45 Q 200, 42 266, 45 L 266, 64 Q 200, 61 134, 64 Z" fill="#2C2825" />

      {/* Curved bottom thick charcoal bar */}
      <path d="M 130, 218 Q 200, 221 270, 218 L 267, 237 Q 200, 240 133, 237 Z" fill="#2C2825" />

      {/* Gold Star */}
      <polygon points="200,75 204.5,83.5 214,84.5 207,91 209,100 200,95.5 191,100 193,91 186,84.5 195.5,83.5" fill="#B3937A" />

      {/* Delicate dotted/double lines left of star */}
      <line x1="138" y1="91" x2="178" y2="91" stroke="#B3937A" strokeWidth="0.75" />
      <line x1="140" y1="94" x2="176" y2="94" stroke="#B3937A" strokeWidth="0.5" strokeDasharray="1.5 1.5" />

      {/* Delicate dotted/double lines right of star */}
      <line x1="222" y1="91" x2="262" y2="91" stroke="#B3937A" strokeWidth="0.75" />
      <line x1="224" y1="94" x2="260" y2="94" stroke="#B3937A" strokeWidth="0.5" strokeDasharray="1.5 1.5" />

      {/* Left Foliage/Laurel Branch */}
      <g transform="translate(108, 116)" stroke="#B3937A" strokeWidth="1" fill="none">
        <path d="M 5, 0 Q -3, 22 5, 45" strokeWidth="1.2" />
        <path d="M 5, 0 Q -6, -2 -1, 3" fill="#B3937A" />
        <path d="M 2, 10 Q -8, 8 -3, 13" fill="#B3937A" />
        <path d="M 1, 20 Q -9, 18 -4, 23" fill="#B3937A" />
        <path d="M 2, 30 Q -8, 28 -3, 33" fill="#B3937A" />
        <path d="M 4, 40 Q -6, 38 -1, 43" fill="#B3937A" />
      </g>

      {/* Right Foliage/Laurel Branch (Mirrored) */}
      <g transform="translate(287, 116) scale(-1, 1)" stroke="#B3937A" strokeWidth="1" fill="none">
        <path d="M 5, 0 Q -3, 22 5, 45" strokeWidth="1.2" />
        <path d="M 5, 0 Q -6, -2 -1, 3" fill="#B3937A" />
        <path d="M 2, 10 Q -8, 8 -3, 13" fill="#B3937A" />
        <path d="M 1, 20 Q -9, 18 -4, 23" fill="#B3937A" />
        <path d="M 2, 30 Q -8, 28 -3, 33" fill="#B3937A" />
        <path d="M 4, 40 Q -6, 38 -1, 43" fill="#B3937A" />
      </g>

      {/* Main "THEODOR" text - exactly bold serif, uppercase, wide tracking */}
      <text
        x="200"
        y="156"
        textAnchor="middle"
        fill="#2C2825"
        fontSize="30"
        fontFamily="Playfair Display, Georgia, Times New Roman, serif"
        fontWeight="800"
        letterSpacing="2.5"
      >
        THEODOR
      </text>

      {/* Central Diamond divider line */}
      <line x1="150" y1="174" x2="185" y2="174" stroke="#B3937A" strokeWidth="0.75" />
      <polygon points="200,169.5 204.5,174 200,178.5 195.5,174" fill="#B3937A" />
      <line x1="215" y1="174" x2="250" y2="174" stroke="#B3937A" strokeWidth="0.75" />

      {/* "V I N T A G E" text - elegant, highly spaced */}
      <text
        x="200"
        y="198"
        textAnchor="middle"
        fill="#2C2825"
        fontSize="12.5"
        fontFamily="Playfair Display, Georgia, Times New Roman, serif"
        letterSpacing="7.5"
        fontWeight="400"
      >
        VINTAGE
      </text>

      {/* Bottom dots */}
      <circle cx="182" cy="256" r="2.2" fill="#B3937A" />
      <circle cx="200" cy="258" r="3.2" fill="#B3937A" />
      <circle cx="218" cy="256" r="2.2" fill="#B3937A" />
    </svg>
  );
}
