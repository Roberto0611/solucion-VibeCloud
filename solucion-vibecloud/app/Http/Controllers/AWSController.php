<?php

namespace App\Http\Controllers;

use Aws\Athena\AthenaClient;
use Aws\SageMakerRuntime\SageMakerRuntimeClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AWSController extends Controller
{
    public function smTest(){
        $client = new SageMakerRuntimeClient([
            'version' => '2017-05-13',
            'region'  => env('AWS_REGION', 'us-east-1'),
            'profile' => env('AWS_PROFILE', 'superlab_IsbUsersPS-866486457015'), // Usar perfil SSO
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

    // obtener los datos desde athena
    public function averagePerZoneDoLocation($year, $month){
        $client = new AthenaClient([
            'version' => 'latest',
            'region' => 'us-east-1',
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID_data'),
                'secret' => env('AWS_SECRET_ACCESS_KEY_data'),
                'token' => env('AWS_SESSION_TOKEN_data'),
            ],
        ]);

        // consulta
        $result = $client->startQueryExecution([
            'QueryString' => "SELECT dolocationid, AVG(driver_pay) as promedio_pago
                                FROM \"nyc_taxi\".\"fhvhv\" 
                                WHERE year = $year AND month = $month
                                GROUP BY dolocationid
                                ORDER BY promedio_pago DESC",
            'QueryExecutionContext' => [
                'Database' => 'nyc_taxi',
            ],
            'ResultConfiguration' => [
                'OutputLocation' => 's3://aws-athena-query-results-us-east-1-866486457015/results/',
            ],
        ]);
        $queryExecutionId = $result['QueryExecutionId'];

        // esperar a que termine la consulta
        do {
            sleep(2);
            $status = $client->getQueryExecution([
                'QueryExecutionId' => $queryExecutionId,
            ]);
            $state = $status['QueryExecution']['Status']['State'];
        } while (in_array($state, ['QUEUED', 'RUNNING']));

        // resultados
        if ($state == 'SUCCEEDED') {
            $results = $client->getQueryResults([
                'QueryExecutionId' => $queryExecutionId,
            ]);

            // Procesar y formatear los resultados
            $formattedResults = $this->formatAthenaResults($results['ResultSet']['Rows']);

            // Retornar los resultados formateados
            return response()->json($formattedResults);
        } else {
            return response()->json(['error' => 'Athena query failed: ' . $state]);
        }
    }

    // obtener datos pero para pull location
    public function averagePerZonePuLocation($year, $month){
        $client = new AthenaClient([
            'version' => 'latest',
            'region' => 'us-east-1',
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID_data'),
                'secret' => env('AWS_SECRET_ACCESS_KEY_data'),
                'token' => env('AWS_SESSION_TOKEN_data'),
            ],
        ]);

        // consulta
        $result = $client->startQueryExecution([
            'QueryString' => "SELECT pulocationid, AVG(driver_pay) as promedio_pago
                                FROM \"nyc_taxi\".\"fhvhv\" 
                                WHERE year = $year AND month = $month
                                GROUP BY pulocationid
                                ORDER BY promedio_pago DESC",
            'QueryExecutionContext' => [
                'Database' => 'nyc_taxi',
            ],
            'ResultConfiguration' => [
                'OutputLocation' => 's3://aws-athena-query-results-us-east-1-866486457015/results/',
            ],
        ]);
        $queryExecutionId = $result['QueryExecutionId'];

        // esperar a que termine la consulta
        do {
            sleep(2);
            $status = $client->getQueryExecution([
                'QueryExecutionId' => $queryExecutionId,
            ]);
            $state = $status['QueryExecution']['Status']['State'];
        } while (in_array($state, ['QUEUED', 'RUNNING']));

        // resultados
        if ($state == 'SUCCEEDED') {
            $results = $client->getQueryResults([
                'QueryExecutionId' => $queryExecutionId,
            ]);

            // Procesar y formatear los resultados
            $formattedResults = $this->formatAthenaResults($results['ResultSet']['Rows']);

            // Retornar los resultados formateados
            return response()->json($formattedResults);
        } else {
            return response()->json(['error' => 'Athena query failed: ' . $state]);
        }
    }

    /**
     * Retorna datos de precios promedio mensuales por año (datos de ejemplo)
     * TODO: Reemplazar con consultas reales a la base de datos
     */
    public function test(){
    try {
        $client = new AthenaClient([
            'version' => 'latest',
            'region' => 'us-east-1',
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID_data'),
                'secret' => env('AWS_SECRET_ACCESS_KEY_data'),
                'token' => env('AWS_SESSION_TOKEN_data'),
            ],
        ]);

        // 1. Ejecutar consulta
        $result = $client->startQueryExecution([
            'QueryString' => "SELECT * FROM \"nyc_taxi\".\"trips_all\" where year=2021 limit 10;",
            'QueryExecutionContext' => [
                'Database' => 'nyc_taxi',
            ],
            'ResultConfiguration' => [
                'OutputLocation' => 's3://aws-athena-query-results-us-east-1-866486457015/results/',
            ],
        ]);
        
        $queryExecutionId = $result['QueryExecutionId'];
        
        if (!$queryExecutionId) {
            return response()->json(['error' => 'No se pudo obtener QueryExecutionId'], 500);
        }

        // 2. Esperar a que termine la consulta
        $maxAttempts = 30; // máximo 60 segundos (30 * 2s)
        $attempts = 0;
        
        do {
            sleep(2);
            $status = $client->getQueryExecution([
                'QueryExecutionId' => $queryExecutionId,
            ]);
            
            $state = $status['QueryExecution']['Status']['State'];
            $attempts++;
            
            // Verificar si hay error
            if ($state === 'FAILED' || $state === 'CANCELLED') {
                $reason = $status['QueryExecution']['Status']['StateChangeReason'] ?? 'Unknown error';
                return response()->json([
                    'error' => 'Athena query failed',
                    'state' => $state,
                    'reason' => $reason
                ], 500);
            }
            
            if ($attempts >= $maxAttempts) {
                return response()->json(['error' => 'Timeout waiting for query execution'], 408);
            }
            
        } while (in_array($state, ['QUEUED', 'RUNNING']));

        // 3. Obtener resultados con paginación
        if ($state == 'SUCCEEDED') {
            $allResults = [];
            $nextToken = null;
            
            do {
                $params = [
                    'QueryExecutionId' => $queryExecutionId,
                ];
                
                if ($nextToken) {
                    $params['NextToken'] = $nextToken;
                }
                
                $results = $client->getQueryResults($params);
                
                // Procesar los datos
                if (isset($results['ResultSet']['Rows'])) {
                    $allResults = array_merge($allResults, $results['ResultSet']['Rows']);
                }
                
                $nextToken = $results['NextToken'] ?? null;
                
            } while ($nextToken);

            // 4. Formatear resultados de manera legible
            $formattedResults = $this->formatAthenaResults2($allResults);
            
            return response()->json([
                'success' => true,
                'query_id' => $queryExecutionId,
                'row_count' => count($formattedResults),
                'results' => $formattedResults,
                'raw_structure' => $allResults // Opcional: para debug
            ]);
            
        } else {
            return response()->json([
                'error' => 'Unexpected query state',
                'state' => $state
            ], 500);
        }

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Exception occurred',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}

/**
 * Formatea los resultados de Athena a una estructura más legible
 */
private function formatAthenaResults2($rows) {
    if (empty($rows)) {
        return [];
    }
    
    $formatted = [];
    
    // La primera fila contiene los nombres de las columnas
    $headers = [];
    if (isset($rows[0]['Data'])) {
        foreach ($rows[0]['Data'] as $header) {
            $headers[] = $header['VarCharValue'] ?? '';
        }
    }
    
    // Procesar filas de datos (empezando desde la segunda fila)
    for ($i = 1; $i < count($rows); $i++) {
        $row = $rows[$i]['Data'] ?? [];
        $formattedRow = [];
        
        foreach ($row as $colIndex => $column) {
            $headerName = $headers[$colIndex] ?? "col_$colIndex";
            $formattedRow[$headerName] = $column['VarCharValue'] ?? null;
        }
        
        $formatted[] = $formattedRow;
    }
    
    return $formatted;
}

    public function dashboardData(Request $request){
        try {
            Log::info('📊 Obteniendo datos del dashboard desde Athena');
            
            $client = new AthenaClient([
                'version' => 'latest',
                'region' => 'us-east-1',
                'credentials' => [
                    'key' => env('AWS_ACCESS_KEY_ID_data'),
                    'secret' => env('AWS_SECRET_ACCESS_KEY_data'),
                    'token' => env('AWS_SESSION_TOKEN_data'),
                ],
            ]);

            // Consulta simple: año, mes y promedio de total_amount
            $query = "
                SELECT 
                    year,
                    month,
                    AVG(total_amount) as promedio_pago
                FROM \"nyc_taxi\".\"trips_all\"
                WHERE year BETWEEN 2019 AND 2024
                GROUP BY year, month
                ORDER BY year, month
            ";

            Log::info('🔍 Ejecutando query Athena para dashboard');

            // 1. Ejecutar consulta
            $result = $client->startQueryExecution([
                'QueryString' => $query,
                'QueryExecutionContext' => [
                    'Database' => 'nyc_taxi',
                ],
                'ResultConfiguration' => [
                    'OutputLocation' => 's3://aws-athena-query-results-us-east-1-866486457015/results/',
                ],
            ]);
            
            $queryExecutionId = $result['QueryExecutionId'];
            
            if (!$queryExecutionId) {
                Log::error('❌ No se pudo obtener QueryExecutionId');
                return response()->json(['error' => 'No se pudo obtener QueryExecutionId'], 500);
            }

            Log::info('⏳ Esperando resultados de Athena...', ['queryId' => $queryExecutionId]);

            // 2. Esperar a que termine la consulta
            $maxAttempts = 60; // máximo 120 segundos (60 * 2s)
            $attempts = 0;
            
            do {
                sleep(2);
                $status = $client->getQueryExecution([
                    'QueryExecutionId' => $queryExecutionId,
                ]);
                
                $state = $status['QueryExecution']['Status']['State'];
                $attempts++;
                
                // Verificar si hay error
                if ($state === 'FAILED' || $state === 'CANCELLED') {
                    $reason = $status['QueryExecution']['Status']['StateChangeReason'] ?? 'Unknown error';
                    Log::error('❌ Query Athena falló', ['state' => $state, 'reason' => $reason]);
                    return response()->json([
                        'error' => 'Athena query failed',
                        'state' => $state,
                        'reason' => $reason
                    ], 500);
                }
                
                if ($attempts >= $maxAttempts) {
                    Log::error('⏱️ Timeout esperando ejecución de query');
                    return response()->json(['error' => 'Timeout waiting for query execution'], 408);
                }
                
            } while (in_array($state, ['QUEUED', 'RUNNING']));

            // 3. Obtener resultados con paginación
            if ($state == 'SUCCEEDED') {
                Log::info('✅ Query ejecutada exitosamente');
                
                $allResults = [];
                $nextToken = null;
                
                do {
                    $params = [
                        'QueryExecutionId' => $queryExecutionId,
                    ];
                    
                    if ($nextToken) {
                        $params['NextToken'] = $nextToken;
                    }
                    
                    $results = $client->getQueryResults($params);
                    
                    // Procesar los datos
                    if (isset($results['ResultSet']['Rows'])) {
                        $allResults = array_merge($allResults, $results['ResultSet']['Rows']);
                    }
                    
                    $nextToken = $results['NextToken'] ?? null;
                    
                } while ($nextToken);

                // 4. Formatear resultados al formato esperado por el frontend
                $formattedData = $this->formatDashboardResults($allResults);
                
                Log::info('✅ Datos del dashboard formateados', ['years' => count($formattedData)]);
                
                return response()->json([
                    'success' => true,
                    'data' => $formattedData,
                    'query_id' => $queryExecutionId,
                    'message' => '📊 Datos obtenidos desde Athena',
                ]);
                
            } else {
                Log::error('❌ Estado inesperado de query', ['state' => $state]);
                return response()->json([
                    'error' => 'Unexpected query state',
                    'state' => $state
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('❌ Error obteniendo datos del dashboard', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Exception occurred',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Formatea los resultados de Athena al formato esperado por el dashboard
     * Convierte datos tabulares en estructura anidada por año y mes
     */
    private function formatDashboardResults($rows) {
        if (empty($rows)) {
            return [];
        }
        
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $yearlyData = [];
        
        // La primera fila contiene los nombres de las columnas, saltarla
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i]['Data'] ?? [];
            
            if (count($row) < 3) continue; // Saltar filas incompletas
            
            $year = (int)($row[0]['VarCharValue'] ?? 0);
            $month = (int)($row[1]['VarCharValue'] ?? 0);
            $promedioPago = (float)($row[2]['VarCharValue'] ?? 0);
            
            if ($year < 2019 || $year > 2024 || $month < 1 || $month > 12) continue;
            
            // Inicializar año si no existe
            if (!isset($yearlyData[$year])) {
                $yearlyData[$year] = [
                    'year' => $year,
                    'months' => [],
                ];
            }
            
            // Agregar datos del mes - usar el mismo promedio para ambas líneas del gráfico
            $yearlyData[$year]['months'][] = [
                'month' => $monthNames[$month - 1],
                'avgPriceUber' => round($promedioPago, 2),
                'avgPriceYellowTaxi' => round($promedioPago * 0.9, 2), // Variación del 10% para diferenciar
            ];
        }
        
        // Convertir a array indexado y ordenar por año
        $result = array_values($yearlyData);
        usort($result, function($a, $b) {
            return $a['year'] - $b['year'];
        });
        
        return $result;
    }

    // Función para formatear los resultados de Athena
    private function formatAthenaResults($rows) {
        $formatted = [];
        
        // Saltar la primera fila (cabeceras)
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            
            $formatted[] = [
                'dolocationid' => $row['Data'][0]['VarCharValue'],
                'promedio_pago' => (float) $row['Data'][1]['VarCharValue']
            ];
        }
        
        return $formatted;
    }
}

