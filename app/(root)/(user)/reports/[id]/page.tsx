"use server";
import React from 'react'
import ReportPage from './client'
interface Props {
  params: Promise<{ id: string }>
}


async function page({ params }: Props) {
  const { id } = await params;

  return (
    <ReportPage id={id} />
  )
}

export default page