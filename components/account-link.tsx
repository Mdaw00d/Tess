'use client';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
export function AccountLink(){const {data}=authClient.useSession();return <Link className="auth-link" href={data?'/account':'/sign-in'}>{data?'Account':'Sign in'}</Link>;}
