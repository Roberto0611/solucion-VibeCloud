<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Taxis_zones extends Model
{
    protected $table = "taxis_zones";

    protected $fillable = [
        'id', // ← Agregar esto
        'Borough', 
        'zone', 
        'service_zone', 
        'latitude', 
        'longitude'
    ];

    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'int';
}
