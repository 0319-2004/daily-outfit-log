import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (session?.user) {
        redirect('/home');
    }

    return <div className="auth-layout">{children}</div>;
}
