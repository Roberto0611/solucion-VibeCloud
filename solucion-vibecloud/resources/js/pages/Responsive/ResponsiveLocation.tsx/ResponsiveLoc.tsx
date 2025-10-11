import React from 'react'
import { Label } from "@/components/ui/label"
import { BreadcrumbLocation } from './BreadcrumbLocation'

const ResponsiveLoc = () => {
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="location-picker" className="px-1 text-center">
                Location
            </Label>
            <BreadcrumbLocation />
        </div>
    )
}

export default ResponsiveLoc
