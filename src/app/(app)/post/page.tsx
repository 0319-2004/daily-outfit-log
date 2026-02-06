'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';
import styles from './post.module.css';

export default function PostPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [faceBlurEnabled, setFaceBlurEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Manual weather selection instead of API
    const [selectedWeather, setSelectedWeather] = useState('晴れ');
    const [temperature, setTemperature] = useState('20');

    // Request camera access on mount and load face detection models
    useEffect(() => {
        loadModels();
        startCamera();

        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const loadModels = async () => {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            setModelsLoaded(true);
            console.log('Face detection models loaded');
        } catch (err) {
            console.error('Failed to load face detection models:', err);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 720, height: 960 }
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError('カメラへのアクセスが拒否されました');
            console.error('Camera error:', err);
        }
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas size to match desired aspect ratio (3:4 for torso)
        canvas.width = 720;
        canvas.height = 960;

        // Draw video frame to canvas (center crop)
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Apply face blur if enabled and models are loaded
        if (faceBlurEnabled && modelsLoaded) {
            try {
                const detections = await faceapi.detectAllFaces(
                    canvas,
                    new faceapi.TinyFaceDetectorOptions()
                );

                if (detections.length > 0) {
                    // Apply blur to each detected face
                    detections.forEach((detection) => {
                        const box = detection.box;
                        // Expand box slightly to ensure full face coverage
                        const expandedBox = {
                            x: Math.max(0, box.x - box.width * 0.2),
                            y: Math.max(0, box.y - box.height * 0.3),
                            width: box.width * 1.4,
                            height: box.height * 1.6,
                        };

                        // Save original state
                        context.save();

                        // Create clipping region for the face
                        context.beginPath();
                        context.rect(expandedBox.x, expandedBox.y, expandedBox.width, expandedBox.height);
                        context.clip();

                        // Apply strong blur filter
                        context.filter = 'blur(25px)';
                        context.drawImage(
                            canvas,
                            expandedBox.x,
                            expandedBox.y,
                            expandedBox.width,
                            expandedBox.height,
                            expandedBox.x,
                            expandedBox.y,
                            expandedBox.width,
                            expandedBox.height
                        );

                        // Restore original state
                        context.restore();
                    });

                    console.log(`Blurred ${detections.length} face(s)`);
                }
            } catch (err) {
                console.error('Face detection error:', err);
                // Continue even if face detection fails
            }
        }

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);

        // Stop camera
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const submitPost = async () => {
        if (!capturedImage) {
            setError('画像が必要です');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: Upload image to Cloudinary
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: capturedImage }),
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                setError(uploadData.error || '画像のアップロードに失敗しました');
                setLoading(false);
                return;
            }

            // Step 2: Create post with weather data
            const weatherData = {
                conditionJa: selectedWeather,
                temp: parseInt(temperature),
            };

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: uploadData.url,
                    weatherData: weatherData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || '投稿に失敗しました');
                setLoading(false);
                return;
            }

            // Success - redirect to home
            router.push('/home');
            router.refresh();
        } catch (err) {
            setError('投稿に失敗しました');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← 戻る
                </button>
                <h1>今日の服を記録</h1>
            </header>

            <main className={styles.main}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.cameraWrapper}>
                    {!capturedImage ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className={styles.video}
                            />
                            <div className={styles.cropGuide}>
                                <div className={styles.guideBox}>
                                    <span>上半身を中心に</span>
                                </div>
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </>
                    ) : (
                        <img src={capturedImage} alt="撮影した写真" className={styles.preview} />
                    )}
                </div>

                <div className={styles.controls}>
                    {!capturedImage ? (
                        <>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={faceBlurEnabled}
                                    onChange={(e) => setFaceBlurEnabled(e.target.checked)}
                                />
                                <span>顔ぼかし</span>
                            </label>
                            <button onClick={capturePhoto} className="btn" style={{ width: '100%' }}>
                                撮影する
                            </button>
                        </>
                    ) : (
                        <div className={styles.actionButtons}>
                            <button onClick={retake} className="btn btn-secondary">
                                撮り直し
                            </button>
                            <button onClick={submitPost} className="btn" disabled={loading}>
                                {loading ? '投稿中...' : '投稿する'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Weather Selection */}
                <div className={styles.weatherSelection}>
                    <label>
                        <span>天気</span>
                        <select
                            value={selectedWeather}
                            onChange={(e) => setSelectedWeather(e.target.value)}
                            className={styles.select}
                        >
                            <option value="晴れ">☀️ 晴れ</option>
                            <option value="曇り">☁️ 曇り</option>
                            <option value="雨">🌧️ 雨</option>
                            <option value="雪">⛄ 雪</option>
                        </select>
                    </label>
                    <label>
                        <span>気温 (°C)</span>
                        <input
                            type="number"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            className={styles.input}
                            min="-20"
                            max="45"
                        />
                    </label>
                </div>
            </main>
        </div>
    );
}
