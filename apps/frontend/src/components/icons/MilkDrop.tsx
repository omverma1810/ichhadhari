export function MilkDrop({ className }: { className?: string }) {
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
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      <circle cx="12" cy="14" r="2" fill="currentColor" />
      <path d="M12 18v2" />
    </svg>
  );
}
