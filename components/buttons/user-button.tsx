"use client"

import { useSession } from '@/providers/session-provider'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import Link from 'next/link';
import { User } from 'lucide-react';

function UserButton() {
    const { logout, user } = useSession();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="bg-[#dc212e] border-1 border-white rounded-full !h-7 !w-7">
                <Button className='cursor-pointer !no-underline' variant={"link"}>
                    <User size={20} stroke="#ffffff" strokeWidth={2.2} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className='w-56'>
                <DropdownMenuLabel>
                    {user?.email || "Loading email..."}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className='cursor-pointer text-sm'>
                    <Link href="/settings">Ayarlar</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className='cursor-pointer text-sm'>Çıkış Yap</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserButton