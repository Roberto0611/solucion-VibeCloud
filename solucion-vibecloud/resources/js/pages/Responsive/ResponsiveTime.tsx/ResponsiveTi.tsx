import React from 'react'
import { Label } from "@/components/ui/label"
import { BreadcrumbTime } from './BreadcrumbTime'

type ResponsiveTiProps = {
    onTimeChange?: (time: string) => void;
}

const ResponsiveTi = ({ onTimeChange }: ResponsiveTiProps) => {
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="time-picker" className="px-1 text-center">
                Time
            </Label>
            <BreadcrumbTime onTimeChange={onTimeChange} />
        </div>
    )
}

export default ResponsiveTi
