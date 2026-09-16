"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="chart-empty">
      <h1>Unable to load the dashboard.</h1>
      <p>Please try again.</p>
      <button className="retry" onClick={reset}>
        Retry
      </button>
    </section>
  );
}
