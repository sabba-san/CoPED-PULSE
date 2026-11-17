import React from 'react';

function SvgIcon({ children, className = 'w-5 h-5', strokeWidth = 2, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function Compass(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" />
    </SvgIcon>
  );
}

export function Briefcase(props) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </SvgIcon>
  );
}

export function BookOpen(props) {
  return (
    <SvgIcon {...props}>
      <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" />
      <path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
    </SvgIcon>
  );
}

export function User(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
    </SvgIcon>
  );
}

export function Search(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </SvgIcon>
  );
}

export function CheckCircle2(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.3 2.3 4.7-5.3" />
    </SvgIcon>
  );
}

export function Star({ className = 'w-4 h-4', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.7 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2" />
    </svg>
  );
}

export function Award(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14.5 7 22l5-2.5L17 22l-1.5-7.5" />
    </SvgIcon>
  );
}

export function ChevronRight(props) {
  return (
    <SvgIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </SvgIcon>
  );
}

export function Layers(props) {
  return (
    <SvgIcon {...props}>
      <polygon points="12 3 3 8 12 13 21 8 12 3" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 18 9 5 9-5" />
    </SvgIcon>
  );
}

export function Check(props) {
  return (
    <SvgIcon {...props}>
      <path d="m5 12.5 4.5 4.5 9.5-9.5" />
    </SvgIcon>
  );
}

export function FileText(props) {
  return (
    <SvgIcon {...props}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </SvgIcon>
  );
}

export function Flame(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2c1.5 3 4 4.5 4 8a4 4 0 1 1-8 0c0-2 1-3.5 2-4.8C10 7 11.2 7.5 12 2z" />
    </SvgIcon>
  );
}

export function HelpCircle(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.8-2.5 2-2.5 3.5" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </SvgIcon>
  );
}

export function X(props) {
  return (
    <SvgIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgIcon>
  );
}

export function Zap(props) {
  return (
    <SvgIcon {...props}>
      <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />
    </SvgIcon>
  );
}

export function LogOut(props) {
  return (
    <SvgIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </SvgIcon>
  );
}

export function RotateCcw(props) {
  return (
    <SvgIcon {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </SvgIcon>
  );
}

export function Settings(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </SvgIcon>
  );
}

export function Share2(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </SvgIcon>
  );
}

export function ArrowRight(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </SvgIcon>
  );
}

export function Camera(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </SvgIcon>
  );
}

export function Pause(props) {
  return (
    <SvgIcon {...props}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </SvgIcon>
  );
}

export function Play(props) {
  return (
    <SvgIcon {...props}>
      <polygon points="6 4 20 12 6 20 6 4" />
    </SvgIcon>
  );
}

export function Sparkles(props) {
  return (
    <SvgIcon {...props}>
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
      <path d="m19 15 .8 1.8L21.5 17.5l-1.7.7L19 20l-.8-1.8-1.7-.7 1.7-.7z" />
    </SvgIcon>
  );
}

