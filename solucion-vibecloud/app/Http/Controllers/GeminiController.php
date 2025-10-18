<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Http;

class GeminiController extends Controller
{
    /**
     * Procesa consultas de texto usando Gemini AI
     * Especializado en extraer información de viajes en taxi
     * Convierte lenguaje natural a JSON estructurado y obtiene predicción de precio
     */
    public function processQuery(Request $request)
    {
        try {
            $query = $request->input('query');
            
            if (!$query) {
                return response()->json([
                    'error' => 'Query is required'
                ], 400);
            }

            Log::info('🤖 Procesando query con Gemini:', ['query' => $query]);

            // Paso 1: Extraer información estructurada con Gemini
            $systemPrompt = "Eres un asistente profesional de reserva de taxis especializado en extraer información de viajes del lenguaje natural.
Tu tarea es extraer la siguiente información de las consultas del usuario y devolverla SOLO como un objeto JSON válido (sin otro texto):

{
  \"pickup_location\": \"<nombre del lugar de recogida o ID de zona si se conoce>\",
  \"dropoff_location\": \"<nombre del lugar de destino o ID de zona si se conoce>\",
  \"pickup_datetime\": \"<fecha/hora en formato YYYY-MM-DD HH:MM:SS, inferir de fechas relativas como 'mañana'>\",
  \"trip_distance_estimate\": <distancia estimada en millas como número>,
  \"pulocationid\": <ID de zona de taxi de NYC para recogida, usa 132 para Times Square si no se especifica>,
  \"dolocationid\": <ID de zona de taxi de NYC para destino, usa 132 para JFK Airport si no se especifica>,
  \"missing_info\": [\"<lista de información requerida faltante>\"],
  \"needs_clarification\": true/false,
  \"professional_message\": \"<mensaje profesional y formal al usuario sobre el viaje o solicitando información faltante. Usa lenguaje formal de negocios EN ESPAÑOL sin emojis.>\"
}

IDs de zona importantes:
- Times Square: 132
- JFK Airport: 132
- LaGuardia Airport: 138
- Newark Airport: 1
- Central Park: 43
- Brooklyn: rango 35-100
- Manhattan: rango 1-260

Si no se especifica la distancia, estímala basándote en distancias comunes de NYC (Times Square a JFK ≈ 17 millas).
La fecha actual es 18 de octubre de 2025.
Usa lenguaje profesional y formal EN ESPAÑOL sin emojis.
Devuelve SOLO el JSON, sin formato markdown, sin explicaciones.";

            $result = Gemini::generativeModel(model: 'gemini-2.0-flash-exp')
                ->generateContent($systemPrompt . "\n\nConsulta del usuario: " . $query);

            $geminiResponse = $result->text();
            
            // Limpiar la respuesta (remover markdown si existe)
            $geminiResponse = preg_replace('/```json\s*|\s*```/', '', $geminiResponse);
            $geminiResponse = trim($geminiResponse);
            
            Log::info('✅ Respuesta de Gemini (raw):', ['response' => $geminiResponse]);

            // Intentar parsear el JSON
            $tripData = json_decode($geminiResponse, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('❌ Error parseando JSON de Gemini:', ['error' => json_last_error_msg()]);
                return response()->json([
                    'success' => false,
                    'response' => $geminiResponse,
                    'error' => 'Could not parse trip information',
                    'originalQuery' => $query
                ], 500);
            }

            Log::info('📋 Información del viaje extraída:', $tripData);

            // Verificar si necesita aclaración
            if ($tripData['needs_clarification'] ?? false) {
                return response()->json([
                    'success' => true,
                    'response' => $tripData['professional_message'] ?? $tripData['friendly_message'] ?? 'Se requiere información adicional para completar su reserva.',
                    'tripData' => $tripData,
                    'needsMoreInfo' => true,
                    'missingInfo' => $tripData['missing_info'] ?? [],
                    'originalQuery' => $query
                ]);
            }

            // Paso 2: Llamar a AMBAS funciones de predicción (Uber y Taxi) en paralelo
            Log::info('🚗 Generando predicciones de precio para Uber y Taxi...');
            
            // Crear el request con los datos del viaje
            $predictData = [
                'pickup_dt_str' => $tripData['pickup_datetime'],
                'pulocationid' => $tripData['pulocationid'],
                'dolocationid' => $tripData['dolocationid'],
                'trip_miles' => $tripData['trip_distance_estimate']
            ];
            
            // Crear requests para ambas predicciones
            $uberRequest = Request::create(
                '/api/predict',
                'POST',
                [],
                [],
                [],
                ['CONTENT_TYPE' => 'application/json'],
                json_encode($predictData)
            );
            
            $taxiRequest = Request::create(
                '/api/predictTaxis',
                'POST',
                [],
                [],
                [],
                ['CONTENT_TYPE' => 'application/json'],
                json_encode($predictData)
            );

            // Llamar directamente a ambos métodos del AWSController
            $awsController = new \App\Http\Controllers\AWSController();
            
            // Predicción Uber (SageMaker ML)
            $uberResponse = $awsController->predictWithSageMaker($uberRequest);
            $uberPrediction = json_decode($uberResponse->getContent(), true);
            $uberPrice = $uberPrediction['predictions'][0] ?? null;
            
            // Predicción Taxi (Algoritmo inteligente)
            $taxiResponse = $awsController->predict($taxiRequest);
            $taxiPrediction = json_decode($taxiResponse->getContent(), true);
            $taxiPrice = $taxiPrediction['predictions'][0] ?? null;
            
            if (!$uberPrice || !$taxiPrice) {
                Log::error('❌ Failed to obtain price predictions');
                return response()->json([
                    'success' => true,
                    'response' => ($tripData['professional_message'] ?? $tripData['friendly_message'] ?? 'Información del viaje recibida.') . "\n\nNo pudimos proporcionar una estimación de precio en este momento. Por favor, inténtelo de nuevo más tarde.",
                    'tripData' => $tripData,
                    'originalQuery' => $query
                ]);
            }

            Log::info('✅ Predicciones obtenidas:', ['uber' => $uberPrice, 'taxi' => $taxiPrice]);

            // Paso 3: Generar análisis comparativo con Gemini
            $analysisPrompt = "Eres un analista profesional de transporte. Analiza estas dos opciones de tarifas y proporciona una recomendación breve y profesional EN ESPAÑOL.

Detalles del Viaje:
- Desde: {$tripData['pickup_location']}
- Hasta: {$tripData['dropoff_location']}
- Distancia: {$tripData['trip_distance_estimate']} millas
- Fecha/Hora: {$tripData['pickup_datetime']}

Opciones de Tarifa:
- Uber: \${$uberPrice}
- Taxi Amarillo: \${$taxiPrice}

Proporciona un análisis conciso (2-3 oraciones) en ESPAÑOL explicando:
1. Qué opción ofrece mejor valor
2. La diferencia de precio
3. Una recomendación profesional

Usa lenguaje formal y profesional EN ESPAÑOL. Sin emojis. Sé conciso y directo.";

            $analysisResult = Gemini::generativeModel(model: 'gemini-2.0-flash-exp')
                ->generateContent($analysisPrompt);

            $analysis = trim($analysisResult->text());
            
            Log::info('📊 Análisis generado:', ['analysis' => $analysis]);

            // Paso 4: Generar respuesta final profesional con ambos precios y análisis
            $professionalMsg = $tripData['professional_message'] ?? $tripData['friendly_message'] ?? 'Su viaje ha sido procesado.';
            
            $finalMessage = $professionalMsg . "\n\n";
            $finalMessage .= "RESUMEN DEL VIAJE\n";
            $finalMessage .= "────────────────────────────────\n";
            $finalMessage .= "Origen: " . $tripData['pickup_location'] . "\n";
            $finalMessage .= "Destino: " . $tripData['dropoff_location'] . "\n";
            $finalMessage .= "Programado: " . $tripData['pickup_datetime'] . "\n";
            $finalMessage .= "Distancia: Aproximadamente " . $tripData['trip_distance_estimate'] . " millas\n\n";
            
            $finalMessage .= "COMPARACIÓN DE TARIFAS\n";
            $finalMessage .= "────────────────────────────────\n";
            $finalMessage .= "Uber:         $" . number_format($uberPrice, 2) . "\n";
            $finalMessage .= "Taxi Amarillo: $" . number_format($taxiPrice, 2) . "\n";
            
            // Mostrar diferencia
            $difference = abs($uberPrice - $taxiPrice);
            $cheaper = $uberPrice < $taxiPrice ? 'Uber' : 'Taxi Amarillo';
            $finalMessage .= "\nAhorro:       $" . number_format($difference, 2) . " con {$cheaper}\n\n";
            
            $finalMessage .= "ANÁLISIS\n";
            $finalMessage .= "────────────────────────────────\n";
            $finalMessage .= $analysis;

            return response()->json([
                'success' => true,
                'response' => $finalMessage,
                'tripData' => $tripData,
                'predictions' => [
                    'uber' => [
                        'price' => $uberPrice,
                        'metadata' => $uberPrediction['metadata'] ?? null
                    ],
                    'taxi' => [
                        'price' => $taxiPrice,
                        'metadata' => $taxiPrediction['metadata'] ?? null
                    ]
                ],
                'analysis' => $analysis,
                'originalQuery' => $query
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error procesando con Gemini:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error processing query',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
