import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader, Trash } from 'lucide-react'

interface DeleteButtonProps {
    onSubmit: () => void
    onClose?: () => void
    isDeleting?: boolean
    title?: string
    description?: string
    children?: React.ReactNode
}

function DeleteButton({ onSubmit, onClose, isDeleting, title, description,children }: DeleteButtonProps) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
        onClose?.();
    };

    const handleSubmit = () => {
        onSubmit();
        handleClose();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size={"icon"} variant={"outline"} disabled={isDeleting} className='cursor-pointer'>
                    {children || <Trash size={16} />}
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className='flex justify-end gap-2'>
                    <Button onClick={handleClose} variant='outline' className='flex-1 cursor-pointer'>İptal</Button>
                    <Button onClick={handleSubmit} disabled={isDeleting} className='flex-1 cursor-pointer' variant={"brand"}>
                        {isDeleting && <Loader className="animate-spin mr-2" />}
                        {isDeleting ? "Siliniyor..." : "Sil"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteButton