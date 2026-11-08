'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="release-error"><p className="eyebrow">BREATHE</p><h1>Let’s try that again.</h1><p>This view could not load. Your browser may be offline or a resource may be unavailable.</p><button className="enter-button" onClick={reset}>Try again</button><p>Air quality remains unavailable until a sourced response can be loaded.</p></main>;
}
