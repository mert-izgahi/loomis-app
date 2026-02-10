// app/(root)/admin/layout.tsx
import React from 'react'
import { SidebarProvider } from "@/components/ui/sidebar"
import Sidebar from '@/components/layouts/sidebar'
import Header from '@/components/layouts/header'

function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SidebarProvider>
            <Sidebar />
            <main className='w-full h-screen'>
                <Header />
                <div className='h-[calc(100vh-64px)] overflow-y-scroll p-3'>
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}

export default AdminLayout