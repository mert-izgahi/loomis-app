"use client"
import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from "framer-motion"

interface AuthPatternProps {
    className?: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

function AuthPattern({ className, position = 'top-left' }: AuthPatternProps) {
    const positionClasses = {
        'top-left': 'items-start justify-start',
        'top-right': 'items-start justify-end',
        'bottom-left': 'items-end justify-start',
        'bottom-right': 'items-end justify-end',
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className={cn(
                'relative flex',
                positionClasses[position],
                className
            )}
        >
            <div className="relative">
                <div className="absolute w-[100px] h-[100px] rounded-sm bg-primary opacity-70" />
                <div className="absolute w-[200px] h-[200px] rounded-sm bg-primary opacity-80 -top-10 -left-10" />
                <div className="absolute w-[300px] h-[300px] rounded-sm bg-primary opacity-90 -top-20 -left-20" />
            </div>
        </motion.div>
    )
}

export default AuthPattern