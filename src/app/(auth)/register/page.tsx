'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        displayName: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || '登録に失敗しました');
                setLoading(false);
                return;
            }

            // Auto-login after registration
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError('登録は成功しましたが、ログインに失敗しました');
                setLoading(false);
            } else {
                router.push('/home');
                router.refresh();
            }
        } catch (err) {
            setError('登録に失敗しました');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>今日の服</h1>
                <p className={styles.subtitle}>アカウントを作成</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label htmlFor="email">メールアドレス</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="username">ユーザー名</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="displayName">表示名</label>
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            value={formData.displayName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">パスワード</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? '登録中...' : '登録'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <Link href="/login">既にアカウントをお持ちの方</Link>
                </div>
            </div>
        </div>
    );
}
