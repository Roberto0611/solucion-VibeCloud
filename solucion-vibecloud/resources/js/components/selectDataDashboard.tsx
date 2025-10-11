import React from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type DatasetSelectorProps = {
    value: string;
    onChange: (v: string) => void;
}

const SelectDataDashboard: React.FC<DatasetSelectorProps> = ({ value, onChange }) => {
    return (
        <div style={{ alignItems: 'left', padding: 8, color: "white", display: "flex", gap: 8 }}>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Datos por años</SelectLabel>
                        <SelectItem value="../DatosJSON/csvjson2000.json">Datos del 2000</SelectItem>
                        <SelectItem value="../DatosJSON/csvjson2005.json">Datos del 2005</SelectItem>
                        <SelectItem value="../DatosJSON/csvjson2010.json">Datos del 2010</SelectItem>
                        <SelectItem value="../DatosJSON/csvjson2015.json">Datos del 2015</SelectItem>
                        <SelectItem value="../DatosJSON/csvjson2020.json">Datos del 2020</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>

    )
}


export default SelectDataDashboard
