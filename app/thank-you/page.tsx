'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CheckIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const Confetti = () => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const pieces = Array.from({ length: 50 });
    return (
        <div className="confetti-container">
            {pieces.map((_, i) => (
                <motion.div
                    key={i}
                    className="confetti-piece"
                    initial={{
                        top: "-10%",
                        left: `${Math.random() * 100}%`,
                        rotate: 0,
                        scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{
                        top: "110%",
                        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                        left: `${(Math.random() * 100) + (Math.random() * 20 - 10)}%`
                    }}
                    transition={{
                        duration: Math.random() * 2 + 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                    }}
                    style={{
                        backgroundColor: ['#F1641E', '#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 5)],
                        width: Math.random() * 10 + 5 + 'px',
                        height: Math.random() * 10 + 5 + 'px',
                        position: 'absolute',
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        zIndex: 0
                    }}
                />
            ))}
        </div>
    );
};

export default function ThankYouPage() {
    return (
        <div className="thank-you-wrapper">
            <Confetti />
            <motion.div
                className="thank-you-content"
                initial={{ opacity: 0, scale: 0.9, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="success-icon-container">
                    <CheckIcon />
                </div>

                <h1 className="serif">Thank You!</h1>
                <p>Your meeting request has been successfully received. Our experts will review your information and get back to you on WhatsApp shortly.</p>

                <Link href="/" className="back-home-btn">
                    <HomeIcon />
                    Return to Homepage
                </Link>
            </motion.div>

            <style jsx global>{`
                .thank-you-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fdfdfd;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                }

                .confetti-container {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    pointer-events: none;
                    z-index: 0;
                }

                .thank-you-content {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    padding: 48px;
                    border-radius: 40px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.1);
                }

                .success-icon-container {
                    width: 100px;
                    height: 100px;
                    background: #F1641E;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 32px;
                    box-shadow: 0 12px 30px rgba(241, 100, 30, 0.3);
                }

                .thank-you-content h1 {
                    font-size: 36px;
                    color: #1a1a1a;
                    margin-bottom: 20px;
                    font-weight: 800;
                }

                .thank-you-content p {
                    font-size: 16px;
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }

                .back-home-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    background: #1a1a1a;
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 16px;
                    transition: all 0.3s;
                    width: 100%;
                }

                .back-home-btn:hover {
                    background: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }

                @media (max-width: 500px) {
                    .thank-you-content {
                        padding: 32px 24px;
                        border-radius: 30px;
                    }
                    
                    .thank-you-content h1 {
                        font-size: 28px;
                    }
                }
            `}</style>
        </div>
    );
}
