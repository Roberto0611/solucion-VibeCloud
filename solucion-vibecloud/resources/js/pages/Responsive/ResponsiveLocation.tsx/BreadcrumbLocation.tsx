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
const location = [
    {
        value: "manhattan",
        label: "Manhattan",
    },
    {
        value: "brooklyn",
        label: "Brooklyn",
    },
    {
        value: "queens",
        label: "Queens",
    },
    {
        value: "airport",
        label: "Airport",
    }
]
type BreadcrumbLocationProps = {
    onLocationChange?: (location: string) => void
}

export function BreadcrumbLocation({ onLocationChange }: BreadcrumbLocationProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const handleLocationSelect = (currentValue: string) => {
        const newValue = currentValue === value ? "" : currentValue
        setValue(newValue)
        setOpen(false)
        onLocationChange?.(newValue)
    }
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
                        ? location.find((location) => location.value === value)?.label
                        : "Select location..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search location..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                            {location.map((location) => (
                                <CommandItem
                                    key={location.value}
                                    value={location.value}
                                    onSelect={handleLocationSelect}
                                >
                                    {location.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === location.value ? "opacity-100" : "opacity-0"
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