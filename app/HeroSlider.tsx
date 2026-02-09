'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const defaultSlides = [
    {
        id: 1,
        // Valentine's theme placeholder
        image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2940&auto=format&fit=crop',
        title: "Make this your best Valentine's Day yet",
        buttonText: "Shop our must-haves",
        link: "#"
    },
    {
        id: 2,
        // Fashion/Shopping theme placeholder
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2940&auto=format&fit=crop',
        title: "New Season Arrivals",
        buttonText: "Browse Collection",
        link: "#"
    },
    {
        id: 3,
        // Lifestyle/Gift theme placeholder
        image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=2940&auto=format&fit=crop',
        title: "Exclusive Deals",
        buttonText: "Shop Now",
        link: "#"
    }
];

export default function HeroSlider() {
    const [slides, setSlides] = useState<any[]>(defaultSlides);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        fetch('/api/hero-slides')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setSlides(data.map((s: any) => ({
                        id: s.id,
                        image: s.image_url,
                        title: '',
                        buttonText: '',
                        link: '#'
                    })));
                }
            })
            .catch(err => console.error('Failed to load hero slides:', err));
    }, []);

    // Auto-slide effect
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000); // 5 seconds

        return () => clearInterval(timer);
    }, [currentIndex, slides.length]);

    const slideVariants = {
        hiddenRight: {
            x: "100%",
            opacity: 0,
        },
        hiddenLeft: {
            x: "-100%",
            opacity: 0,
        },
        visible: {
            x: "0",
            opacity: 1,
            transition: {
                duration: 0.5
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.5
            },
        },
    };

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleDotClick = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    if (slides.length === 0) return null;

    return (
        <div className="store-mobile-hero mobile-only" style={{
            padding: 0,
            background: '#000',
            overflow: 'hidden',
            position: 'relative',
            height: '100px',
            display: 'block' // Overrides flex from class
        }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
                        animate="visible"
                        exit="exit"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    >


                        <img
                            src={slides[currentIndex].image}
                            alt={slides[currentIndex].title || 'Slide'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />


                    </motion.div>
                </AnimatePresence>
            </div>



            {/* Dots */}
            {slides.length > 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 20
                }}>
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleDotClick(idx)}
                            style={{
                                width: idx === currentIndex ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
