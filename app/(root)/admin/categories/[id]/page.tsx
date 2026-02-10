import React from 'react'
import EditCategoryPage from './client'

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
    <EditCategoryPage id={id} />
  )
}

export default page