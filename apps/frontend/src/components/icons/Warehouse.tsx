export function Warehouse({ className }: { className?: string }) {
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
      <path d="M3 21h18" />
      <path d="M3 7v1a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V7" />
      <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <rect x="7" y="13" width="3" height="8" />
      <rect x="14" y="13" width="3" height="8" />
    </svg>
  );
}
