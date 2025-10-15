import React from 'react'
import { Label } from "@/components/ui/label"
import { BreadcrumbYear } from './BreadcrumbYear'

type ResponsiveYearProps = {
    label?: string
    value?: string
    onYearChange?: (year: string) => void
}

const ResponsiveYear = ({ label = 'Year', value, onYearChange }: ResponsiveYearProps) => {
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="year-picker" className="px-1 text-center">
                {label}
            </Label>
            <BreadcrumbYear value={value} onYearChange={onYearChange} />
        </div>
    )
}

export default ResponsiveYear