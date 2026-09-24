export function Loading({ text = 'Loading...' }: { text?: string }) {
  return <div className="loading-state"><div className="spinner" /><span>{text}</span></div>
}
