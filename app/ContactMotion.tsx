'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, MessageSquare, PhoneCall } from 'lucide-react';

const ContactMotion = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const scheduleTooltip = () => {
            const randomDelay = Math.random() * (20000 - 10000) + 10000; // 10-20 seconds
            timeoutId = setTimeout(() => {
                setShowTooltip(true);
                // Hide after 10 seconds
                setTimeout(() => {
                    setShowTooltip(false);
                    scheduleTooltip(); // Reschedule after hiding
                }, 10000);
            }, randomDelay);
        };

        scheduleTooltip();

        return () => clearTimeout(timeoutId);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        show: { opacity: 1, y: 0, scale: 1 }
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <AnimatePresence>
                {showTooltip && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            bottom: '70px',
                            right: '0',
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 10000
                        }}
                    >


                        {/* Bubble */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '10px 16px',
                            borderRadius: '16px 16px 4px 16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            color: '#1e293b',
                            fontSize: '14px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1px'
                        }}>
                            {"Hi! Contact with us...".split('').map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        duration: 0.03,
                                        delay: index * 0.03,
                                        ease: "linear"
                                    }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', marginBottom: '8px' }}
                    >
                        {/* Call Us */}
                        <motion.a
                            href="tel:+8801919760626" // Updated contact number
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '6px 6px 6px 16px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                            <span style={{ marginRight: '12px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>Call Us</span>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Phone size={20} />
                            </div>
                        </motion.a>

                        {/* Messenger */}
                        <motion.a
                            href="https://m.me/100335266150128" // Updated messenger link to user specific ID
                            target="_blank"
                            rel="noopener noreferrer"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '6px 6px 6px 16px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                            <span style={{ marginRight: '12px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>Messenger</span>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <MessageCircle size={20} />
                            </div>
                        </motion.a>

                        {/* WhatsApp */}
                        <motion.a
                            href="https://wa.me/8801989224436" // Updated whatsapp number
                            target="_blank"
                            rel="noopener noreferrer"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '6px 6px 6px 16px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                            <span style={{ marginRight: '12px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>WhatsApp</span>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                {/* Simple WhatsApp Icon Placeholder since Lucide doesn't have brand icons, creating a similar shape */}
                                <PhoneCall size={20} />
                            </div>
                        </motion.a>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleOpen}
                animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                        "0 4px 12px rgba(0,0,0,0.2)",
                        "0 4px 20px rgba(0,0,0,0.4)",
                        "0 4px 12px rgba(0,0,0,0.2)"
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageSquare size={24} fill="currentColor" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default ContactMotion;
