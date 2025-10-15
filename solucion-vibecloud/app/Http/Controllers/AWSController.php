<?php

namespace App\Http\Controllers;

use Aws\SageMakerRuntime\SageMakerRuntimeClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        try {
            $client = new SageMakerRuntimeClient([
                'version' => '2017-05-13',
                'region'  => env('AWS_REGION', 'us-east-1'),
                'http'    => ['timeout' => 10, 'connect_timeout' => 3],
            ]);

            $inputData = json_decode($request->getContent(), true);
            
            // Validar y convertir datos
            $payload = [
                'instances' => [[
                    'pickup_dt_str' => $inputData['pickup_dt_str'] ?? '2025-11-06 08:30:00',
                    'pulocationid'  => (int)($inputData['pulocationid'] ?? 132),
                    'dolocationid'  => (int)($inputData['dolocationid'] ?? 235),
                    'trip_miles'    => (float)($inputData['trip_miles'] ?? 3.2),
                ]],
            ];

            Log::info('🚀 Enviando a SageMaker:', $payload);

            $res = $client->invokeEndpoint([
                'EndpointName' => env('SM_ENDPOINT_NAME'),
                'ContentType'  => 'application/json',
                'Accept'       => 'application/json',
                'Body'         => json_encode($payload, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),
            ]);

            $responseBody = (string) $res->get('Body');
            Log::info('✅ Respuesta de SageMaker:', ['body' => $responseBody]);

            return response($responseBody, 200)->header('Content-Type', 'application/json');

        } catch (\Aws\SageMakerRuntime\Exception\SageMakerRuntimeException $e) {
            Log::error('❌ Error SageMaker:', [
                'message' => $e->getMessage(),
                'code' => $e->getAwsErrorCode(),
                'type' => $e->getAwsErrorType(),
            ]);
            
            return response()->json([
                'error' => 'Error al invocar el modelo de predicción',
                'message' => $e->getMessage(),
                'details' => [
                    'code' => $e->getAwsErrorCode(),
                    'type' => $e->getAwsErrorType(),
                ]
            ], 500);

        } catch (\Exception $e) {
            Log::error('❌ Error general:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Método de prueba que simula una predicción
     * Devuelve un número aleatorio sin llamar a SageMaker
     */
    public function predictTest(Request $request){
        // Recibir los datos del request
        $data = $request->all();
        
        Log::info('📝 Datos recibidos en predictTest:', $data);
        
        // Simular un delay como si estuviera procesando
        sleep(1);
        
        // Generar predicción aleatoria (precio entre $20 y $100)
        $randomPrediction = round(rand(2000, 10000) / 100, 2);
        
        // Simular una respuesta similar a la que daría SageMaker
        $response = [
            'predictions' => [$randomPrediction], // AWS SageMaker retorna array de predicciones
            'input_data' => [
                'pickup_dt_str' => $data['pickup_dt_str'] ?? null,
                'pulocationid' => $data['pulocationid'] ?? null,
                'dolocationid' => $data['dolocationid'] ?? null,
                'trip_miles' => $data['trip_miles'] ?? null,
            ],
            'message' => '⚠️ Predicción de PRUEBA. Para usar el modelo real de AWS SageMaker, cambia a /api/predict',
            'timestamp' => now()->toIso8601String(),
        ];
        
        Log::info('✅ Respuesta de predictTest:', $response);
        
        return response()->json($response, 200);
    }
}

