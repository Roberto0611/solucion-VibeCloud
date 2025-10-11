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
const time = [
    {
        value: "0-1",
        label: "0:00 - 1:00",
    },
    {
        value: "1-2",
        label: "1:00 - 2:00",
    },
    {
        value: "2-3",
        label: "2:00 - 3:00",
    },
    {
        value: "3-4",
        label: "3:00 - 4:00",
    },
    {
        value: "4-5",
        label: "4:00 - 5:00",
    },
    {
        value: "5-6",
        label: "5:00 - 6:00",
    },
    {
        value: "6-7",
        label: "6:00 - 7:00",
    },
    {
        value: "7-8",
        label: "7:00 - 8:00",
    },
    {
        value: "8-9",
        label: "8:00 - 9:00",
    },
    {
        value: "9-10",
        label: "9:00 - 10:00",
    },
    {
        value: "10-11",
        label: "10:00 - 11:00",
    },
    {
        value: "11-12",
        label: "11:00 - 12:00",
    },
    {
        value: "12-13",
        label: "12:00 - 13:00",
    },
    {
        value: "13-14",
        label: "13:00 - 14:00",
    },
    {
        value: "14-15",
        label: "14:00 - 15:00",
    },
    {
        value: "15-16",
        label: "15:00 - 16:00",
    },
    {
        value: "16-17",
        label: "16:00 - 17:00",
    },
    {
        value: "17-18",
        label: "17:00 - 18:00",
    },
    {
        value: "18-19",
        label: "18:00 - 19:00",
    },
    {
        value: "19-20",
        label: "19:00 - 20:00",
    },
    {
        value: "20-21",
        label: "20:00 - 21:00",
    },
    {
        value: "21-22",
        label: "21:00 - 22:00",
    },
    {
        value: "22-23",
        label: "22:00 - 23:00",
    },
    {
        value: "23-24",
        label: "23:00 - 0:00",
    },
]
export function BreadcrumbTime() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
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
                        ? time.find((time) => time.value === value)?.label
                        : "Select time..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search framework..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No time found.</CommandEmpty>
                        <CommandGroup>
                            {time.map((time) => (
                                <CommandItem
                                    key={time.value}
                                    value={time.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {time.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === time.value ? "opacity-100" : "opacity-0"
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