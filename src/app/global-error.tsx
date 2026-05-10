'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Georgia, "Times New Roman", serif', margin: 0, padding: 0, backgroundColor: '#ffffff', color: '#1a1a2e' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '1rem' }}>
          <h2 style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Something went wrong!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ padding: '0.625rem 1.5rem', borderRadius: '0.75rem', backgroundColor: '#7C3AED', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
