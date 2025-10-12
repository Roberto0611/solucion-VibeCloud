import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { BreadcrumbTime } from "./Responsive/ResponsiveTime.tsx/BreadcrumbTime"
import { BreadcrumbLocation } from "./Responsive/ResponsiveLocation.tsx/BreadcrumbLocation"

type Calendar24Props = {
    onDateChange?: (date: string | undefined) => void;
}

export function Calendar24({ onDateChange }: Calendar24Props) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)

    const formatDateIso = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate);
        const payload = newDate ? formatDateIso(newDate) : undefined;
        onDateChange?.(payload);
        setOpen(false);
    };

    return (
        <div className="flex gap-4">
            <div className="flex flex-col gap-3">
                <Label htmlFor="date-picker" className="px-1 text-center">
                    Date
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker"
                            className="w-32 justify-between font-normal"
                        >
                            {date ? formatDateIso(date) : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={handleDateSelect}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
