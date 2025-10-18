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
            $systemPrompt = "You are a professional taxi booking assistant specialized in extracting trip information from natural language.
Your task is to extract the following information from user queries and return it ONLY as a valid JSON object (no other text):

{
  \"pickup_location\": \"<pickup location name or zone ID if known>\",
  \"dropoff_location\": \"<dropoff location name or zone ID if known>\",
  \"pickup_datetime\": \"<datetime in format YYYY-MM-DD HH:MM:SS, infer from relative dates like 'tomorrow'>\",
  \"trip_distance_estimate\": <estimated distance in miles as a number>,
  \"pulocationid\": <NYC taxi zone ID for pickup, use 132 for Times Square if not specified>,
  \"dolocationid\": <NYC taxi zone ID for dropoff, use 132 for JFK Airport if not specified>,
  \"missing_info\": [\"<list of missing required information>\"],
  \"needs_clarification\": true/false,
  \"professional_message\": \"<professional, formal message to user about the trip or requesting missing information. Use formal business language without emojis.>\"
}

Important zone IDs:
- Times Square: 132
- JFK Airport: 132
- LaGuardia Airport: 138
- Newark Airport: 1
- Central Park: 43
- Brooklyn: 35-100 range
- Manhattan: 1-260 range

If distance is not specified, estimate based on common NYC distances (Times Square to JFK ≈ 17 miles).
Current date is October 18, 2025.
Use professional, formal language without emojis.
Return ONLY the JSON, no markdown formatting, no explanations.";

            $result = Gemini::generativeModel(model: 'gemini-2.0-flash-exp')
                ->generateContent($systemPrompt . "\n\nUser query: " . $query);

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
                    'response' => $tripData['professional_message'] ?? $tripData['friendly_message'] ?? 'Additional information is required to complete your booking.',
                    'tripData' => $tripData,
                    'needsMoreInfo' => true,
                    'missingInfo' => $tripData['missing_info'] ?? [],
                    'originalQuery' => $query
                ]);
            }

            // Paso 2: Llamar a la función predict() real de AWS SageMaker
            Log::info('Generating price prediction using AWS SageMaker...');
            
            // Crear el request con los datos del viaje usando create()
            $predictData = [
                'pickup_dt_str' => $tripData['pickup_datetime'],
                'pulocationid' => $tripData['pulocationid'],
                'dolocationid' => $tripData['dolocationid'],
                'trip_miles' => $tripData['trip_distance_estimate']
            ];
            
            // Crear un request con JSON en el contenido
            $predictRequest = Request::create(
                '/api/predict',
                'POST',
                [],
                [],
                [],
                ['CONTENT_TYPE' => 'application/json'],
                json_encode($predictData)
            );

            // Llamar directamente al método predict() del AWSController (predicción real de SageMaker)
            $awsController = new \App\Http\Controllers\AWSController();
            $predictResponse = $awsController->predict($predictRequest);
            
            $prediction = json_decode($predictResponse->getContent(), true);
            $predictedPrice = $prediction['predictions'][0] ?? null;
            
            if (!$predictedPrice) {
                Log::error('Failed to obtain price prediction');
                return response()->json([
                    'success' => true,
                    'response' => ($tripData['professional_message'] ?? $tripData['friendly_message'] ?? 'Trip information received.') . "\n\nWe are unable to provide a price estimate at this time. Please try again later.",
                    'tripData' => $tripData,
                    'originalQuery' => $query
                ]);
            }

            Log::info('Price prediction obtained:', ['price' => $predictedPrice]);

            // Paso 3: Generar respuesta final profesional con el precio
            $professionalMsg = $tripData['professional_message'] ?? $tripData['friendly_message'] ?? 'Your trip has been processed.';
            
            $finalMessage = $professionalMsg . "\n\n";
            $finalMessage .= "TRIP SUMMARY\n";
            $finalMessage .= "────────────────────────────────\n";
            $finalMessage .= "Estimated Fare: $" . number_format($predictedPrice, 2) . "\n";
            $finalMessage .= "Pickup: " . $tripData['pickup_location'] . "\n";
            $finalMessage .= "Destination: " . $tripData['dropoff_location'] . "\n";
            $finalMessage .= "Scheduled: " . $tripData['pickup_datetime'] . "\n";
            $finalMessage .= "Distance: Approximately " . $tripData['trip_distance_estimate'] . " miles";

            return response()->json([
                'success' => true,
                'response' => $finalMessage,
                'tripData' => $tripData,
                'prediction' => [
                    'price' => $predictedPrice,
                    'input' => $prediction['input_data'] ?? null
                ],
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
