export function Yogurt({ className }: { className?: string }) {
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
      <path d="M7 2h10l1 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6l1-4z" />
      <path d="M7 6h10" />
      <path d="M10 6L9 2" />
      <path d="M14 6l1-4" />
      <ellipse cx="12" cy="13" rx="3" ry="2" />
    </svg>
  );
}
