<?php

namespace App\Http\Controllers;

use Aws\SageMakerRuntime\SageMakerRuntimeClient;
use Illuminate\Http\Request;

class AWSController extends Controller
{
    public function smTest(){
        $client = new SageMakerRuntimeClient([
        'version' => '2017-05-13',
        'region'  => env('AWS_REGION', 'us-east-1'),
        // El SDK usará AWS_ACCESS_KEY_ID/SECRET del .env o el perfil por defecto
        'http'    => ['timeout' => 10, 'connect_timeout' => 3],
    ]);

    $payload = [
        'instances' => [[
            'pickup_dt_str' => '2025-11-06 08:30:00',
            'pulocationid'  => 132,
            'dolocationid'  => 235,
            'trip_miles'    => 3.2,
            // 'include_interval' => true,
        ]],
    ];

    $res = $client->invokeEndpoint([
        'EndpointName' => env('SM_ENDPOINT_NAME'),
        'ContentType'  => 'application/json',
        'Accept'       => 'application/json',
        'Body'         => json_encode($payload, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),
    ]);

    return response((string) $res->get('Body'), 200)->header('Content-Type', 'application/json');
    }

    public function predict(Request $request){
        $client = new SageMakerRuntimeClient([
        'version' => '2017-05-13',
        'region'  => env('AWS_REGION', 'us-east-1'),
        // El SDK usará AWS_ACCESS_KEY_ID/SECRET del .env o el perfil por defecto
        'http'    => ['timeout' => 10, 'connect_timeout' => 3],
    ]);

    $payload = json_decode($request->getContent(), true);

    $payload = [
        'instances' => [[
            'pickup_dt_str' => $payload['pickup_dt_str'] ?? '2025-11-06 08:30:00',
            'pulocationid'  => $payload['pulocationid'] ?? 132,
            'dolocationid'  => $payload['dolocationid'] ?? 235,
            'trip_miles'    => $payload['trip_miles'] ?? 3.2,
            // 'include_interval' => true,
        ]],
    ];

    $res = $client->invokeEndpoint([
        'EndpointName' => env('SM_ENDPOINT_NAME'),
        'ContentType'  => 'application/json',
        'Accept'       => 'application/json',
        'Body'         => json_encode($payload, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),
    ]);

    return response((string) $res->get('Body'), 200)->header('Content-Type', 'application/json');
    }

    /**
     * Método de prueba que simula una predicción
     * Devuelve un número aleatorio sin llamar a SageMaker
     */
    public function predictTest(Request $request){
        // Recibir los datos del request
        $data = $request->all();
        
        // Simular un delay como si estuviera procesando
        sleep(1);
        
        // Generar predicción aleatoria (número de taxis entre 10 y 100)
        $randomPrediction = rand(20, 100);
        
        // Simular una respuesta similar a la que daría SageMaker
        $response = [
            'success' => true,
            'prediction' => $randomPrediction,
            'input_data' => [
                'date' => $data['date'] ?? null,
                'location_from' => $data['location_from'] ?? null,
                'location_to' => $data['location_to'] ?? null,
            ],
            'message' => 'Esta es una predicción de prueba. Cambia la ruta a /api/predict para usar el modelo real.',
            'timestamp' => now()->toIso8601String(),
        ];
        
        return response()->json($response, 200);
    }
}

