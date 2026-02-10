"use client"
import React, { useState } from 'react'
import { Button } from '../ui/button';
import Modal from '../shared/modal';
import { useSession } from '@/providers/session-provider';
import { Loader2 } from 'lucide-react';
function SignoutButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, loggingOut } = useSession();
    
    return (
        <>
            <Button variant="outline" className='cursor-pointer' onClick={() => setIsOpen(true)}>
                Çıkış Yap
            </Button>
            <Modal
                title="Oturma Çıkışı"
                description="Çıkış yapmak istediginize emin misiniz?"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <div className="w-full grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Button onClick={() => setIsOpen(false)} variant={"outline"}>Iptal Et</Button>
                    <Button variant="destructive" onClick={logout} disabled={loggingOut}>
                        {loggingOut && <Loader2 className="animate-spin mr-2" />}
                        Çıkış Yap
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default SignoutButton