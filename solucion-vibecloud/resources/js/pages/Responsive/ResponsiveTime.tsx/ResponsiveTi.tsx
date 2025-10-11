import React from 'react'
import { Label } from "@/components/ui/label"
import { BreadcrumbTime } from './BreadcrumbTime'

const ResponsiveTi = () => {
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="time-picker" className="px-1 text-center">
                Time
            </Label>
            <BreadcrumbTime />
        </div>
    )
}

export default ResponsiveTi
