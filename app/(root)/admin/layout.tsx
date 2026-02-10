// app/(root)/admin/layout.tsx
import React from 'react'


async function layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div >
            {children}
        </div>
    )
}

export default layout