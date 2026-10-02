import Link from 'next/link';
export default function Missing(){return <section className="page-shell"><div className="eyebrow">404</div><h1>This piece is missing.</h1><p className="intro">Explore the library to find an available definition.</p><Link className="button primary" href="/skills">Browse skills →</Link></section>}
