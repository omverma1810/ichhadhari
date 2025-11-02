export function Factory({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 20h20" />
      <path d="M4 20V10l6-3v3l6-3v13" />
      <path d="M16 20V10l4 2v8" />
      <path d="M8 13h2v4H8z" />
      <path d="M14 13h2v4h-2z" />
    </svg>
  );
}
