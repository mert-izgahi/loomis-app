"use client"
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { cn } from '@/lib/utils'
interface ModalProps {
    title?: string
    description?: string
    isOpen?: boolean
    onClose?: () => void
    children?: React.ReactNode
    className?: string
}

function Modal({ title, description, isOpen, onClose, children, className }: ModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn('rounded-sm shadow-xs', className)}>
                <DialogHeader className=''>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default Modal