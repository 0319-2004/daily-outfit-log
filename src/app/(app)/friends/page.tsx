'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './friends.module.css';

type Friend = {
    id: string;
    displayName: string;
    username: string;
    status: string;
};

export default function FriendsPage() {
    const router = useRouter();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingReceived, setPendingReceived] = useState<Friend[]>([]);
    const [pendingSent, setPendingSent] = useState<Friend[]>([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends');
            const data = await response.json();

            if (response.ok) {
                setFriends(data.friends || []);
                setPendingReceived(data.pendingReceived || []);
                setPendingSent(data.pendingSent || []);
            }
        } catch (err) {
            console.error('Failed to fetch friends:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchUsername.trim()) return;

        setError('');
        try {
            const response = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addresseeUsername: searchUsername.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || '友達申請に失敗しました');
                return;
            }

            setSearchUsername('');
            fetchFriends();
        } catch (err) {
            setError('友達申請に失敗しました');
        }
    };

    const handleFriendRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
        try {
            const response = await fetch(`/api/friends/${friendshipId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                fetchFriends();
            }
        } catch (err) {
            console.error('Failed to handle request:', err);
        }
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
                <h1>友達</h1>
            </header>

            <main className={styles.main}>
                {/* Friend Request Form */}
                <section className={styles.section}>
                    <h2>友達を追加</h2>
                    <form onSubmit={sendFriendRequest} className={styles.searchForm}>
                        <input
                            type="text"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            placeholder="ユーザー名を入力"
                            className={styles.input}
                        />
                        <button type="submit" className="btn">
                            申請を送る
                        </button>
                    </form>
                    {error && <p className={styles.error}>{error}</p>}
                    <p className={styles.hint}>
                        友達は最大30人まで追加できます ({friends.length}/30)
                    </p>
                </section>

                {/* Pending Requests Received */}
                {pendingReceived.length > 0 && (
                    <section className={styles.section}>
                        <h2>友達申請 ({pendingReceived.length})</h2>
                        <ul className={styles.list}>
                            {pendingReceived.map((friend) => (
                                <li key={friend.id} className={styles.listItem}>
                                    <div>
                                        <p className={styles.name}>{friend.displayName}</p>
                                        <p className={styles.username}>@{friend.username}</p>
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => handleFriendRequest(friend.id, 'accept')}
                                            className="btn btn-sm"
                                        >
                                            承認
                                        </button>
                                        <button
                                            onClick={() => handleFriendRequest(friend.id, 'reject')}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            拒否
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Pending Requests Sent */}
                {pendingSent.length > 0 && (
                    <section className={styles.section}>
                        <h2>送信済み申請 ({pendingSent.length})</h2>
                        <ul className={styles.list}>
                            {pendingSent.map((friend) => (
                                <li key={friend.id} className={styles.listItem}>
                                    <div>
                                        <p className={styles.name}>{friend.displayName}</p>
                                        <p className={styles.username}>@{friend.username}</p>
                                    </div>
                                    <span className={styles.pending}>保留中</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Friends List */}
                <section className={styles.section}>
                    <h2>友達リスト ({friends.length})</h2>
                    {friends.length === 0 ? (
                        <p className={styles.empty}>まだ友達がいません</p>
                    ) : (
                        <ul className={styles.list}>
                            {friends.map((friend) => (
                                <li key={friend.id} className={styles.listItem}>
                                    <div>
                                        <p className={styles.name}>{friend.displayName}</p>
                                        <p className={styles.username}>@{friend.username}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}
