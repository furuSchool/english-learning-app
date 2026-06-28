'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>エラーが発生しました</h2>
            <button
              onClick={() => unstable_retry()}
              style={{ padding: '0.5rem 1.5rem', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              もう一度試す
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
