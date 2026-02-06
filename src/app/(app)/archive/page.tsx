'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './archive.module.css';

type Post = {
    id: string;
    imageUrl: string;
    timestamp: Date;
    weatherData: string;
    timeband: string;
    dayType: string;
    isLate: boolean;
};

export default function ArchivePage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArchive();
    }, []);

    const fetchArchive = async () => {
        try {
            // This would need a new API route /api/posts/me or similar
            // For now, using the same endpoint (will show all posts if posted today)
            const response = await fetch('/api/posts');
            const data = await response.json();

            if (response.ok && data.posts) {
                setPosts(data.posts);
            }
        } catch (err) {
            console.error('Failed to fetch archive:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <p>読み込み中...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← 戻る
                </button>
                <h1>アーカイブ</h1>
            </header>

            <main className={styles.main}>
                {posts.length === 0 ? (
                    <div className={styles.empty}>
                        <p>まだ投稿がありません</p>
                        <button onClick={() => router.push('/post')} className="btn">
                            最初の投稿をする
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {posts.map((post) => (
                            <div key={post.id} className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    <img src={post.imageUrl} alt="outfit" />
                                    {post.isLate && (
                                        <span className={styles.lateBadge}>遅れて投稿</span>
                                    )}
                                </div>
                                <div className={styles.info}>
                                    <p className={styles.date}>{formatDate(post.timestamp)}</p>
                                    <p className={styles.context}>
                                        {post.timeband} · {post.dayType}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
