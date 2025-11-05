
import React from 'react'
import ChordChipInput from './ChordChipInput';




function CardSkeleton() {
  return (
    <div className="pointer-events-none select-none animate-pulse rounded-xl border p-4">
      <div className="h-5 w-1/3 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
      <div className="mt-4 h-28 w-full rounded bg-gray-200" />
      <div className="mt-4 h-10 w-full rounded bg-gray-200" />
    </div>
  );
}

function PrimaryButton({ loading, children, ...props }: any) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`h-11 w-full rounded-lg px-4 font-medium transition
        ${loading ? "opacity-60 pointer-events-none" : "active:scale-[0.99]"}`}
    >
      {children}
    </button>
  );
}

function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]"
    >
      {children}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="app p-[clamp(12px,2vw,16px)]">
      <header className="sticky top-0 z-10 -mx-[clamp(12px,2vw,16px)] mb-4 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-screen-sm p-[clamp(12px,2vw,16px)]">
          <h1 className="text-[clamp(18px,4vw,22px)] font-semibold">Mobile‑First Sandbox</h1>
          <p className="text-[clamp(13px,2.5vw,15px)] text-gray-600">Skeletons, safe‑areas, and a responsive grid.</p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-sm space-y-4">
        <PrimaryButton loading={loading} onClick={() => alert('Clicked!')}>
          {loading ? 'Loading…' : 'Primary action'}
        </PrimaryButton>
<ChordChipInput />

        {loading ? (
          <ResponsiveGrid>
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </ResponsiveGrid>
        ) : (
          
          <ResponsiveGrid>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="text-[clamp(14px,2.5vw,16px)] font-medium">Card #{i + 1}</div>
                <p className="mt-2 text-[clamp(13px,2.3vw,15px)] text-gray-600">
                  This card never disappears on small screens thanks to the minmax grid.
                </p>
                <button className="mt-3 h-10 w-full rounded-lg bg-gray-900 text-white active:scale-[0.99]">
                  Tap
                </button>
              </div>
            ))}
          </ResponsiveGrid>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-screen-sm grid grid-cols-3">
          {['Home','Search','Profile'].map((t, i) => (
            <button key={t} className="h-14 text-[clamp(12px,2.5vw,14px)]">
              {t}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
