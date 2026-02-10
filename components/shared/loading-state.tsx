"use client"
import { Loader2 } from 'lucide-react'
import React from 'react'

function LoadingState() {
  return (
    <div className='w-full h-[calc(100vh-64px)] flex justify-center items-center'>
        <Loader2 size={32} className='animate-spin' />
    </div>
  )
}

export default LoadingState