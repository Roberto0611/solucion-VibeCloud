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

const months = [
    {
        value: "01",
        label: "January",
    },
    {
        value: "02",
        label: "February",
    },
    {
        value: "03",
        label: "March",
    },
    {
        value: "04",
        label: "April",
    },
    {
        value: "05",
        label: "May",
    },
    {
        value: "06",
        label: "June",
    },
    {
        value: "07",
        label: "July",
    },
    {
        value: "08",
        label: "August",
    },
    {
        value: "09",
        label: "September",
    },
    {
        value: "10",
        label: "October",
    },
    {
        value: "11",
        label: "November",
    },
    {
        value: "12",
        label: "December",
    },
]

type BreadcrumbMonthProps = {
    onMonthChange?: (month: string) => void
    value?: string
}

export function BreadcrumbMonth({ onMonthChange, value }: BreadcrumbMonthProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? months.find((month) => month.value === value)?.label
                        : "Select month..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search year..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No month found.</CommandEmpty>
                        <CommandGroup>
                            {months.map((month) => (
                                <CommandItem
                                    key={month.value}
                                    value={month.value}
                                    onSelect={(currentValue) => {
                                        const newValue = currentValue === value ? "" : currentValue
                                        onMonthChange?.(newValue)
                                        setOpen(false)
                                    }}
                                >
                                    {month.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === month.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}