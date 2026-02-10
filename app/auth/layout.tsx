import React from 'react'

async function layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className='w-screen h-screen p-4 relative overflow-hidden'
             style={{background: "linear-gradient(90deg, #ffd6dd 0%, #ffe6c9 35%, #fff8cc 65%, #cfeef9 100%"}}>
            <div className='w-full h-full flex justify-center items-center rounded'>
                {children}
            </div>
        </div>
    )
}

export default layout
