export function Cheese({ className }: { className?: string }) {
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
      <path d="M2.27 18.72L3.82 14.4C4.07 13.67 4.73 13.17 5.5 13.17H18.5C19.27 13.17 19.93 13.67 20.18 14.4L21.73 18.72C22.09 19.73 21.36 20.83 20.28 20.83H3.72C2.64 20.83 1.91 19.73 2.27 18.72Z" />
      <circle cx="8" cy="16" r="1" />
      <circle cx="14" cy="17" r="1" />
      <path d="M3 13L12 3L21 13" />
      <circle cx="9" cy="8" r="1" />
      <circle cx="15" cy="9" r="1" />
    </svg>
  );
}
