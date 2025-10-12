"use client"
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"



type TimeProps = {
    onTimeChange?: (time: string) => void;
}

export function BreadcrumbTime({ onTimeChange }: TimeProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const handleTimeSelect = (currentValue: string) => {
        const newValue = currentValue === value ? "" : currentValue;
        setValue(newValue);
        onTimeChange?.(newValue);
        setOpen(false);
    };

    return (
        <div className="flex flex-col gap-3">
            <Input
                type="time"
                id="time-picker"
                step="1"
                value={value}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = e.target.value;
                    setValue(v);
                    onTimeChange?.(v);
                }}
            />
        </div>
    )
}