import Image from 'next/image';
import styles from './PostCard.module.css';

interface Post {
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
}

interface PostCardProps {
    post: Post;
    currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
    const weather = JSON.parse(post.weatherData);
    const isOwnPost = post.user.id === currentUserId;

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                <img
                    src={post.imageUrl}
                    alt={`${post.user.displayName}の服`}
                    className={styles.image}
                />

                <div className={styles.context}>
                    <div className={styles.badges}>
                        {post.isLate && (
                            <span className={styles.lateBadge}>遅れて投稿</span>
                        )}
                    </div>

                    <div className={styles.metadata}>
                        <span className={styles.weather}>
                            {weather.conditionJa} {weather.temp}°C
                        </span>
                        <span className={styles.separator}>·</span>
                        <span>{post.timeband}</span>
                        <span className={styles.separator}>·</span>
                        <span>{post.dayType}</span>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.userInfo}>
                    <span className={styles.displayName}>{post.user.displayName}</span>
                    <span className={styles.username}>@{post.user.username}</span>
                </div>

                {!isOwnPost && (
                    <button className={styles.saveBtn}>保存</button>
                )}
            </div>
        </div>
    );
}
