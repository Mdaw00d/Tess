'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="page-shell"><h1>The library is temporarily unavailable.</h1><p className="intro">Please try again in a moment.</p><button className="button primary" onClick={reset}>Try again</button></section>}
