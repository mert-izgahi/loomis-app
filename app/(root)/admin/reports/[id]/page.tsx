import React from 'react'
import EditReportPage from './client';
interface Props {
    params: Promise<{ id: string }>
}
async function page({ params }: Props) {
    const { id } = await params;
    return (
        <EditReportPage id={id} />
    )
}

export default page