<?php

namespace App\Services;

use App\Models\CourseMessage;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppApiService
{
    /**
     * Dispatch an outbound message via Meta WhatsApp Cloud API (or simulate in local/sandbox).
     */
    public function dispatchMessage(CourseMessage $message, ?string $toPhone = null): array
    {
        $phone = $toPhone ?? $message->recipient?->phone;

        if (! $phone) {
            return [
                'status' => 'skipped',
                'reason' => 'No phone number available for recipient',
            ];
        }

        $token = config('services.whatsapp.token');
        $phoneNumberId = config('services.whatsapp.phone_number_id');

        if ($token && $phoneNumberId) {
            try {
                $response = Http::withToken($token)
                    ->post("https://graph.facebook.com/v21.0/{$phoneNumberId}/messages", [
                        'messaging_product' => 'whatsapp',
                        'to' => $phone,
                        'type' => 'text',
                        'text' => [
                            'body' => $message->body,
                        ],
                    ]);

                return [
                    'status' => $response->successful() ? 'sent' : 'failed',
                    'response' => $response->json(),
                ];
            } catch (\Throwable $e) {
                Log::warning('WhatsApp Cloud API dispatch error: ' . $e->getMessage());

                return [
                    'status' => 'error',
                    'error' => $e->getMessage(),
                ];
            }
        }

        // Sandbox / Local development simulation
        Log::info("WhatsApp Cloud API Simulation: Dispatched to {$phone}: {$message->body}");

        return [
            'status' => 'simulated',
            'to' => $phone,
            'message_id' => 'wamid.HBgL' . uniqid(),
            'body' => $message->body,
        ];
    }

    /**
     * Simulate an incoming WhatsApp reply from a user into a course chat.
     */
    public function simulateIncomingReply(int $courseId, int $senderUserId, ?string $text = null, ?int $recipientId = null): CourseMessage
    {
        $content = trim($text ?? '') !== ''
            ? $text
            : 'Waalaikumsalam! Thank you for reaching out. Let me know which module topic you would like to review.';

        $body = str_starts_with($content, '[WhatsApp] ') ? $content : '[WhatsApp] ' . $content;

        return CourseMessage::create([
            'course_id' => $courseId,
            'sender_id' => $senderUserId,
            'recipient_id' => $recipientId,
            'body' => $body,
        ]);
    }
}
