<?php

namespace App\Http\Controllers;

use App\Models\Taxis_zones;
use Illuminate\Http\Request;

class zonesController extends Controller
{
    public function getZones(){
        $zones = Taxis_zones::all();
        return response()->json($zones);
    }
    
    public function getZoneById($id){
        $zone = Taxis_zones::find($id);
        if ($zone) {
            return response()->json($zone);
        } else {
            return response()->json(['message' => 'Zone not found'], 404);
        }
    }
}
