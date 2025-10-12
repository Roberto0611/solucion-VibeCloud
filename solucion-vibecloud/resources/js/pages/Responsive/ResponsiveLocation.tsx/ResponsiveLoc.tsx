import React from 'react'
import { Label } from "@/components/ui/label"
import { BreadcrumbLocation } from './BreadcrumbLocation'

type ResponsiveLocProps = {
    label?: string
    onLocationChange?: (location: string) => void
}

const ResponsiveLoc = ({ label = 'Location', onLocationChange }: ResponsiveLocProps) => {
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="location-picker" className="px-1 text-center">
                {label}
            </Label>
            <BreadcrumbLocation onLocationChange={onLocationChange} />
        </div>
    )
}

export default ResponsiveLoc
