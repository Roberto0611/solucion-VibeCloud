"use client"
import * as React from "react"
import { Check, ChevronsUpDown, Search as SearchIcon } from "lucide-react"
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
    value?: string
}

export function BreadcrumbLocation({ onLocationChange, value }: BreadcrumbLocationProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState<string>("") // id seleccionado
    const [search, setSearch] = React.useState("") // texto de búsqueda
    const [zones, setZones] = React.useState<Zone[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        console.log('BreadcrumbLocation: popover open =>', open)
    }, [open])

    // Cargar zonas desde la API cuando el componente se monta
    React.useEffect(() => {
        fetch('/api/getZones')
            .then(res => res.json())
            .then(data => {
                setZones(data)
                setLoading(false)
                console.log('BreadcrumbLocation: loaded zones', Array.isArray(data) ? data.length : typeof data, data?.[0])
            })
            .catch(err => {
                console.error('Error cargando zonas:', err)
                setLoading(false)
            })
    }, [])

    // Keep selectedId in sync if parent controls value (value is zone name)
    React.useEffect(() => {
        if (value == null) {
            setSelectedId("")
            return
        }
        // find zone by name and set selectedId
        const found = zones.find(z => String(z.zone) === String(value))
        if (found) setSelectedId(found.id.toString())
        else setSelectedId("")
    }, [value, zones])

    React.useEffect(() => {
        console.log('BreadcrumbLocation: received value prop ->', value)
    }, [value])

    // Keep search input in sync with controlled value so the popover input shows it
    React.useEffect(() => {
        if (value == null) {
            setSearch("")
            return
        }
        setSearch(String(value))
    }, [value])

    const handleLocationSelectById = (id: string) => {
        const zone = zones.find(z => z.id.toString() === id)
        const newId = id === selectedId ? "" : id
        setSelectedId(newId)
        setOpen(false)
        // enviar el nombre de la zona al padre (o cadena vacía si se deselecciona)
        onLocationChange?.(newId ? (zone?.zone ?? "") : "")
    }

    const filteredZones = React.useMemo(() => {
        const q = (search ?? '').trim().toLowerCase()
        if (!q) return zones
        return zones.filter(z => {
            const name = String(z?.zone ?? '').toLowerCase()
            const bor = String(z?.Borough ?? '').toLowerCase()
            return name.includes(q) || bor.includes(q)
        })
    }, [zones, search])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {loading ? "Loading..." : (
                        // prefer controlled value if provided
                        value ? value : (
                            selectedId
                                ? zones.find((zone) => zone.id.toString() === selectedId)?.zone
                                : "Select location..."
                        )
                    )}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    {/* Native input replacement for CommandInput to ensure change events are captured reliably */}
                    <div data-slot="command-input-wrapper" className="flex h-9 items-center gap-2 border-b px-3">
                        <SearchIcon className="size-4 shrink-0 opacity-50" />
                        <input
                            data-slot="command-input"
                            autoFocus
                            placeholder="Search location..."
                            className={"placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"}
                            value={search}
                            onChange={(e) => {
                                console.log('NativeInput onChange ->', e.target.value)
                                setSearch(e.target.value)
                            }}
                        />
                    </div>
                    <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                            {filteredZones.map((zone) => (
                                <CommandItem
                                    key={zone.id}
                                    value={zone.id.toString()}
                                    onSelect={(val) => handleLocationSelectById(String(val))}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{zone.zone}</span>
                                        <span className="text-xs text-muted-foreground">{zone.Borough}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            selectedId === zone.id.toString() ? "opacity-100" : "opacity-0"
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