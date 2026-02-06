import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { userPostedToday, getFriendIds } from '@/lib/auth-utils';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import styles from './home.module.css';

export default async function HomePage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const userId = session.user.id;
    const posted = await userPostedToday(userId);

    type PostWithUser = {
        id: string;
        imageUrl: string;
        weatherData: string;
        timeband: string;
        dayType: string;
        isLate: boolean;
        timestamp: Date;
        user: {
            id: string;
            displayName: string;
            username: string;
        };
    };

    let posts: PostWithUser[] = [];

    if (posted) {
        const friendIds = await getFriendIds(userId);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        posts = await prisma.post.findMany({
            where: {
                userId: { in: [...friendIds, userId] },
                timestamp: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
        });
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>今日の服</h1>
                <nav className={styles.nav}>
                    <Link href="/friends">友達</Link>
                    <Link href="/archive">記録</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {!posted ? (
                    <div className={styles.needToPost}>
                        <p>今日の投稿が必要です</p>
                        <Link href="/post" className="btn">
                            投稿する
                        </Link>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={styles.noPosts}>
                        <p>まだ投稿がありません</p>
                    </div>
                ) : (
                    <div className={styles.feed}>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} currentUserId={userId} />
                        ))}
                    </div>
                )}
            </main>

            {posted && (
                <Link href="/post" className={styles.alreadyPosted}>
                    本日は投稿済みです
                </Link>
            )}

            {!posted && (
                <Link href="/post" className={styles.fab}>
                    +
                </Link>
            )}
        </div>
    );
}
