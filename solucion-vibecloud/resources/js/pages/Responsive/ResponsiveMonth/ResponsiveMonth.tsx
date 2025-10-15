import React from 'react'
import { Label } from "@/components/ui/label"
import { BreadcrumbMonth } from './BreadcrumbMonth'

type ResponsiveMonthProps = {
    label?: string
    value?: string
    onMonthChange?: (month: string) => void
}

const ResponsiveMonth = ({ label = 'Month', value, onMonthChange }: ResponsiveMonthProps) => {
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="month-picker" className="px-1 text-center">
                {label}
            </Label>
            <BreadcrumbMonth value={value} onMonthChange={onMonthChange} />
        </div>
    )
}

export default ResponsiveMonth