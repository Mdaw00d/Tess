import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Suspense } from 'react';
import { Analytics } from '@/components/analytics';
export const metadata: Metadata = { title: 'tess — Skills that fit together', description: 'Discover reusable, documented agent skills and loops. Understand their behavior, evaluation, and limitations.' };
export default function Layout({children}: {children: React.ReactNode}) { return <html lang="en" suppressHydrationWarning><body><Suspense fallback={null}><Analytics/></Suspense><Header/><main>{children}</main><footer><a href="/" className="wordmark">tess<span>✳</span></a><span>Small pieces. Larger possibilities.</span><span>Built with intention · MVP preview</span></footer></body></html> }
