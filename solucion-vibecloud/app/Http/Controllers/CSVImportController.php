<?php

namespace App\Http\Controllers;

use App\Models\Taxis_zones;
use Illuminate\Http\Request;

class CSVImportController extends Controller
{
    public function import(){
        // Especificar la ruta absoluta del archivo
        $file = base_path('important-data/taxi_zone_lookup_coordinates.csv');

        $csvData = array_map('str_getcsv', file($file));

        // Eliminar la cabecera
        array_shift($csvData);

        foreach ($csvData as $row) {
            Taxis_zones::create([
                'id' => $row[0],
                'Borough' => $row[1],
                'zone' => $row[2],
                'service_zone' => $row[3],
                'latitude' => $row[4],
                'longitude' => $row[5],
            ]);
        }

        return redirect()->back()->with('success', 'Datos importados correctamente');
    }
}
