export function ColdStorage({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M8 8l-2 2 2 2" />
      <path d="M16 8l2 2-2 2" />
      <path d="M8 14l-2 2 2 2" />
      <path d="M16 14l2 2-2 2" />
    </svg>
  );
}
