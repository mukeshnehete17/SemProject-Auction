export default function FilterBar({ children, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-3 items-center ${className}`}>
      {children}
    </div>
  );
}
