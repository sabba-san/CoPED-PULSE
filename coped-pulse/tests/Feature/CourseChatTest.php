<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseMessage;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseChatTest extends TestCase
{
    use RefreshDatabase;

    private function staff(array $attributes = []): User
    {
        return User::factory()->staff()->create($attributes);
    }

    private function learner(array $attributes = []): User
    {
        return User::factory()->learner()->create($attributes);
    }

    public function test_enrolled_learner_and_instructor_can_send_group_chat_message(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);
        $learner = $this->learner();
        Enrollment::create(['user_id' => $learner->id, 'course_id' => $course->id, 'progress' => 0]);

        // Learner sends a group chat message
        $response1 = $this->actingAs($learner)->postJson(route('courses.chat.messages.store', $course->id), [
            'body' => 'Hello everyone in class!',
            'recipient_id' => null,
        ]);
        $response1->assertCreated()
            ->assertJsonPath('body', 'Hello everyone in class!')
            ->assertJsonPath('recipient_id', null)
            ->assertJsonPath('sender.id', $learner->id);

        // Instructor sends a group chat message
        $response2 = $this->actingAs($instructor)->postJson(route('courses.chat.messages.store', $course->id), [
            'body' => 'Welcome to the course, everyone!',
            'recipient_id' => null,
        ]);
        $response2->assertCreated()
            ->assertJsonPath('body', 'Welcome to the course, everyone!')
            ->assertJsonPath('recipient_id', null)
            ->assertJsonPath('sender.id', $instructor->id);

        $this->assertDatabaseCount('course_messages', 2);

        // Learner queries chat messages
        $indexResponse = $this->actingAs($learner)->getJson(route('courses.chat.messages.index', $course->id));
        $indexResponse->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['body' => 'Hello everyone in class!'])
            ->assertJsonFragment(['body' => 'Welcome to the course, everyone!']);
    }

    public function test_instructor_can_send_direct_message_to_student(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);
        $learner = $this->learner();
        Enrollment::create(['user_id' => $learner->id, 'course_id' => $course->id, 'progress' => 0]);

        $response = $this->actingAs($instructor)->postJson(route('courses.chat.messages.store', $course->id), [
            'body' => 'Great job on the practice quiz!',
            'recipient_id' => $learner->id,
        ]);
        $response->assertCreated()
            ->assertJsonPath('body', 'Great job on the practice quiz!')
            ->assertJsonPath('recipient_id', $learner->id);

        // Learner queries messages and sees the DM
        $learnerResponse = $this->actingAs($learner)->getJson(route('courses.chat.messages.index', $course->id));
        $learnerResponse->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['body' => 'Great job on the practice quiz!']);
    }

    public function test_learner_cannot_view_private_messages_of_another_learner(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);
        $learnerA = $this->learner(['name' => 'Alice Learner']);
        $learnerB = $this->learner(['name' => 'Bob Learner']);
        Enrollment::create(['user_id' => $learnerA->id, 'course_id' => $course->id, 'progress' => 0]);
        Enrollment::create(['user_id' => $learnerB->id, 'course_id' => $course->id, 'progress' => 0]);

        // Instructor sends private message to Learner A
        CourseMessage::create([
            'course_id' => $course->id,
            'sender_id' => $instructor->id,
            'recipient_id' => $learnerA->id,
            'body' => 'Private feedback for Alice only',
        ]);

        // Learner A also replied privately to Instructor
        CourseMessage::create([
            'course_id' => $course->id,
            'sender_id' => $learnerA->id,
            'recipient_id' => $instructor->id,
            'body' => 'Thank you Instructor for the private feedback',
        ]);

        // Group message visible to all
        CourseMessage::create([
            'course_id' => $course->id,
            'sender_id' => $instructor->id,
            'recipient_id' => null,
            'body' => 'General announcement to all students',
        ]);

        // Learner B checks messages
        $responseB = $this->actingAs($learnerB)->getJson(route('courses.chat.messages.index', $course->id));
        $responseB->assertOk();
        $data = $responseB->json();

        $this->assertCount(1, $data);
        $this->assertEquals('General announcement to all students', $data[0]['body']);

        // Confirm private messages are absent for Learner B
        $responseB->assertJsonMissing(['body' => 'Private feedback for Alice only']);
        $responseB->assertJsonMissing(['body' => 'Thank you Instructor for the private feedback']);

        // Learner A checks messages and sees both their DMs and the general announcement
        $responseA = $this->actingAs($learnerA)->getJson(route('courses.chat.messages.index', $course->id));
        $responseA->assertOk();
        $this->assertCount(3, $responseA->json());
    }

    public function test_unenrolled_learner_cannot_post_or_view_messages(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);
        $unenrolledLearner = $this->learner();

        // Attempt to view
        $getResponse = $this->actingAs($unenrolledLearner)->getJson(route('courses.chat.messages.index', $course->id));
        $getResponse->assertForbidden();

        // Attempt to post
        $postResponse = $this->actingAs($unenrolledLearner)->postJson(route('courses.chat.messages.store', $course->id), [
            'body' => 'Unenrolled intrusion message',
        ]);
        $postResponse->assertForbidden();
    }

    public function test_instructor_can_configure_whatsapp_group_link(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
            'whatsapp_group_url' => null,
        ]);

        $response = $this->actingAs($instructor)->post(route('staff.courses.whatsapp-link.update', $course->id), [
            'whatsapp_group_url' => 'https://chat.whatsapp.com/L123AbcDefXyz',
        ]);
        $response->assertSessionHas('success');

        $course->refresh();
        $this->assertEquals('https://chat.whatsapp.com/L123AbcDefXyz', $course->whatsapp_group_url);
    }

    public function test_newly_enrolled_learner_does_not_see_group_messages_sent_before_enrollment(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);

        // Message sent before enrollment
        $preEnrollmentMessage = CourseMessage::forceCreate([
            'course_id' => $course->id,
            'sender_id' => $instructor->id,
            'recipient_id' => null,
            'body' => 'Old announcement from previous semester',
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(5),
        ]);

        // Learner enrolls today
        $learner = $this->learner();
        Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
            'enrolled_at' => now(),
            'created_at' => now(),
        ]);

        // Message sent after enrollment
        $postEnrollmentMessage = CourseMessage::forceCreate([
            'course_id' => $course->id,
            'sender_id' => $instructor->id,
            'recipient_id' => null,
            'body' => 'Welcome new students of this semester!',
            'created_at' => now()->addMinutes(5),
            'updated_at' => now()->addMinutes(5),
        ]);

        $response = $this->actingAs($learner)->getJson(route('courses.chat.messages.index', $course->id));
        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['body' => 'Welcome new students of this semester!']);
        $response->assertJsonMissing(['body' => 'Old announcement from previous semester']);
    }

    public function test_user_can_mark_course_chat_messages_as_read(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);
        $learner = $this->learner();
        Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
            'enrolled_at' => now()->subHour(),
            'created_at' => now()->subHour(),
        ]);

        $msg = CourseMessage::create([
            'course_id' => $course->id,
            'sender_id' => $instructor->id,
            'recipient_id' => null,
            'body' => 'Please check the latest slides',
            'read_at' => null,
            'created_at' => now(),
        ]);

        $this->assertNull($msg->fresh()->read_at);

        $response = $this->actingAs($learner)->postJson(route('courses.chat.mark-read', $course->id));
        $response->assertOk()
            ->assertJsonPath('status', 'ok');

        $this->assertNotNull($msg->fresh()->read_at);
    }

    public function test_whatsapp_api_service_simulates_incoming_reply(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);
        $learner = $this->learner(['phone' => '+60111234567']);
        Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
            'enrolled_at' => now(),
            'created_at' => now(),
        ]);

        $service = app(\App\Services\WhatsAppApiService::class);
        $message = $service->simulateIncomingReply(
            courseId: $course->id,
            senderUserId: $learner->id,
            text: 'Hello instructor from WhatsApp!',
            recipientId: $instructor->id
        );

        $this->assertEquals('[WhatsApp] Hello instructor from WhatsApp!', $message->body);
        $this->assertEquals($learner->id, $message->sender_id);
        $this->assertEquals($instructor->id, $message->recipient_id);

        // Also test the controller simulation endpoint
        $endpointResponse = $this->actingAs($instructor)->postJson(route('courses.chat.whatsapp-simulate', $course->id), [
            'body' => 'Yes, let us schedule a consultation tomorrow.',
            'sender_id' => $learner->id,
            'recipient_id' => $instructor->id,
        ]);

        $endpointResponse->assertCreated()
            ->assertJsonPath('body', '[WhatsApp] Yes, let us schedule a consultation tomorrow.')
            ->assertJsonPath('sender.id', $learner->id);
    }

    public function test_learner_cannot_simulate_whatsapp_reply(): void
    {
        $org = Organization::factory()->create();
        $instructor = $this->staff(['organization_id' => $org->id]);
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);
        $learner = $this->learner();
        Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
            'enrolled_at' => now(),
            'created_at' => now(),
        ]);

        $response = $this->actingAs($learner)->postJson(route('courses.chat.whatsapp-simulate', $course->id), [
            'body' => 'Learner trying to simulate a WhatsApp reply.',
        ]);

        $response->assertForbidden();
    }
}
