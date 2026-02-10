import React from 'react'
import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'



function AnimatedCardsContainer({ children, className,ref }: Readonly<{ children: React.ReactNode, className?: string, ref?: React.Ref<HTMLDivElement> }>) {
    const variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.3, // delay between children
            }
        },
    }
    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate="show"
            viewport={{ once: true, amount: 0.2 }} // trigger when 20% visible
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}


AnimatedCardsContainer.displayName = 'AnimatedCardsContainer'

const AnimatedCard = ({ children, className }: Readonly<{ children: React.ReactNode, className?: string }>) => {
    const variants = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    } as Variants

    return (
        <motion.div variants={variants} className={className}>
            {children}
        </motion.div>
    )
}


AnimatedCard.displayName = 'AnimatedCard'

export { AnimatedCardsContainer, AnimatedCard }