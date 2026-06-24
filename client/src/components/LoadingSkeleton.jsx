export default function LoadingSkeleton({ rows = 4 }) { return <div className="space-y-3">{Array.from({ length: rows }, (_, index) => <div key={index} className="skeleton h-16" />)}</div>; }
