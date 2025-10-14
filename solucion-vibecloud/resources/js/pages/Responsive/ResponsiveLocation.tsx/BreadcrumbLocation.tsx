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

type Zone = {
    id: number;
    Borough: string;
    zone: string;
    service_zone: string;
    latitude: string;
    longitude: string;
}

type BreadcrumbLocationProps = {
    onLocationChange?: (location: string) => void
}

export function BreadcrumbLocation({ onLocationChange }: BreadcrumbLocationProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [zones, setZones] = React.useState<Zone[]>([])
    const [loading, setLoading] = React.useState(true)

    // Cargar zonas desde la API cuando el componente se monta
    React.useEffect(() => {
        fetch('/api/getZones')
            .then(res => res.json())
            .then(data => {
                setZones(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error cargando zonas:', err)
                setLoading(false)
            })
    }, [])

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
                    disabled={loading}
                >
                    {loading ? "Loading..." : (
                        value
                            ? zones.find((zone) => zone.id.toString() === value)?.zone
                            : "Select location..."
                    )}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search location..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                            {zones.map((zone) => (
                                <CommandItem
                                    key={zone.id}
                                    value={zone.id.toString()}
                                    onSelect={handleLocationSelect}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{zone.zone}</span>
                                        <span className="text-xs text-muted-foreground">{zone.Borough}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === zone.id.toString() ? "opacity-100" : "opacity-0"
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