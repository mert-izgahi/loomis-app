"use client"
import React, { useEffect, useState } from 'react'
import { reportStatusOptions } from '@/lib/lookup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useUpdateReportStatus } from '@/hooks/use-reports'
import { toast } from 'sonner'
import { Report } from '@prisma/client'
function ReportStatusField({ report }: { report: Report }) {
  const { mutateAsync, isPending } = useUpdateReportStatus(report.id);
  const [value, setValue] = useState<string>(report.status);
  const handleStatusChange = async (status: string) => {
    await mutateAsync({ status }).then(() => {
      toast.success("Report status updated");
      setValue(status);
    }).catch((error) => {
      toast.error(error.message || "Failed to update report status");
    });
  }

  useEffect(() => {
    setValue(report.status);
  }, [report.status]);
  return (
    <Select disabled={isPending} value={value} onValueChange={handleStatusChange}>
      <SelectTrigger className='w-full max-w-[160px]'>
        <SelectValue placeholder="Select Report Status" />
      </SelectTrigger>
      <SelectContent>
        {reportStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ReportStatusField