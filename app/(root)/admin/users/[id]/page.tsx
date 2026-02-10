import React from 'react'
import EditGroupPage from './client'

interface pageProps {
  params: Promise<
    {
      id: string
    }>
}

async function page({ params }: pageProps) {
  const {id} = await params;

  if(!id) {
    return null;
  }

  return (
    <EditGroupPage id={id} />
  )
}

export default page