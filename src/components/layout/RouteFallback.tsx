export default function RouteFallback() {
  return (
    <div
      className="route-fallback"
      role="status"
      aria-busy="true"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50dvh',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '2px solid var(--s3)',
          borderTopColor: 'var(--acc)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span
        style={{
          marginLeft: 10,
          fontSize: '.72rem',
          color: 'var(--t3)',
          letterSpacing: '.04em',
        }}
      >
        CHARGEMENT…
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
