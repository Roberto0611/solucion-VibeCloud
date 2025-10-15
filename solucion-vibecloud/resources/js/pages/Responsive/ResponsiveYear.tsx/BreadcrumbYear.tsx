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

const years = [
    {
        value: "2019",
        label: "2019",
    },
    {
        value: "2020",
        label: "2020",
    },
    {
        value: "2021",
        label: "2021",
    },
    {
        value: "2022",
        label: "2022",
    },
    {
        value: "2023",
        label: "2023",
    },
    {
        value: "2024",
        label: "2024",
    },
    {
        value: "2025",
        label: "2025",
    }
]

type BreadcrumbYearProps = {
    onYearChange?: (year: string) => void
    value?: string
}

export function BreadcrumbYear({ onYearChange, value }: BreadcrumbYearProps) {
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
                        ? years.find((year) => year.value === value)?.label
                        : "Select year..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search year..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No year found.</CommandEmpty>
                        <CommandGroup>
                            {years.map((year) => (
                                <CommandItem
                                    key={year.value}
                                    value={year.value}
                                    onSelect={(currentValue) => {
                                        const newValue = currentValue === value ? "" : currentValue
                                        onYearChange?.(newValue)
                                        setOpen(false)
                                    }}
                                >
                                    {year.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === year.value ? "opacity-100" : "opacity-0"
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