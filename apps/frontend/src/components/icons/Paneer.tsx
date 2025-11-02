export function Paneer({ className }: { className?: string }) {
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
      <rect x="3" y="8" width="18" height="12" rx="1" />
      <path d="M3 12h18M3 16h18" />
      <path d="M7 8v12M12 8v12M17 8v12" />
    </svg>
  );
}
