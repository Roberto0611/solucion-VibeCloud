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
}
