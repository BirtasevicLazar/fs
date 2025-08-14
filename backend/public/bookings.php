<?php
require_once __DIR__ . '/../database/cors.php';
require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/session.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // Admin-only: pregled zakazanih termina po datumu
    requireLogin();
    $date = sanitizeInput($_GET['date'] ?? '', 'string');
    if ($date === '') { http_response_code(400); echo json_encode(['error' => 'date obavezan']); exit; }
    $stmt = $conn->prepare('SELECT b.id, b.date, b.time, b.customer_name, b.customer_phone, b.status, s.name as service_name, s.duration_minutes, s.price FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.date = ? ORDER BY b.time');
    $stmt->bind_param('s', $date);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode($rows);
    exit;
}

// Create booking (public)
if ($method === 'POST') {
    requireJsonRequest();
    $data = readJsonBody();
    $service_id = sanitizeInput($data['service_id'] ?? null, 'int');
    $name = sanitizeInput($data['customer_name'] ?? '', 'string');
    $phone = sanitizeInput($data['customer_phone'] ?? '', 'string');
    $date = sanitizeInput($data['date'] ?? '', 'string');
    $time = sanitizeInput($data['time'] ?? '', 'string');

    if ($service_id === null || $name === '' || $phone === '' || $date === '' || $time === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Sva polja su obavezna']);
        exit;
    }

    // Simple rate limit by IP: max 5 bookings attempts per 10 minutes
    if (!checkGeneralRateLimit('create_booking', getClientIp(), 5, 600)) {
        http_response_code(429);
        echo json_encode(['error' => 'Previše pokušaja. Pokušajte kasnije.']);
        exit;
    }

    // Basic validation: check service exists and active
    $stmt = $conn->prepare('SELECT id, duration_minutes FROM services WHERE id = ? AND active = 1');
    $stmt->bind_param('i', $service_id);
    $stmt->execute();
    $service = $stmt->get_result()->fetch_assoc();
    if (!$service) { http_response_code(400); echo json_encode(['error' => 'Usluga nije dostupna']); exit; }

    // Check not a day off and within working hours
    $stmt = $conn->prepare('SELECT 1 FROM days_off WHERE date = ?');
    $stmt->bind_param('s', $date);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) { http_response_code(400); echo json_encode(['error' => 'Neradni dan']); exit; }

    $weekday = (int)date('N', strtotime($date));
    $stmt = $conn->prepare('SELECT start_time, end_time FROM working_hours WHERE day_of_week = ?');
    $stmt->bind_param('i', $weekday);
    $stmt->execute();
    $wh = $stmt->get_result()->fetch_assoc();
    if (!$wh) { http_response_code(400); echo json_encode(['error' => 'Nema radnog vremena za ovaj dan']); exit; }

    $slotTs = strtotime($date . ' ' . $time);
    // Disallow booking in the past
    if ($slotTs <= time()) { http_response_code(400); echo json_encode(['error' => 'Ne možete rezervisati prošli termin']); exit; }

    // Read configured interval and ensure alignment
    $interval = 60;
    $resInterval = $conn->query("SELECT `value` FROM settings WHERE `key`='slot_interval_minutes' LIMIT 1");
    if ($resInterval && $resInterval->num_rows > 0) {
        $rowi = $resInterval->fetch_assoc();
        $iv = (int)($rowi['value'] ?? 60);
        if ($iv > 0) { $interval = $iv; }
    }
    $midnight = strtotime($date . ' 00:00:00');
    $aligned = (($slotTs - $midnight) % ($interval * 60)) === 0;
    if (!$aligned) { http_response_code(400); echo json_encode(['error' => 'Termin mora biti poravnat na ' . $interval . ' minuta']); exit; }
    $startTs = strtotime($date . ' ' . $wh['start_time']);
    $endTs = strtotime($date . ' ' . $wh['end_time']);
    if ($slotTs < $startTs || $slotTs + $interval*60 > $endTs) { // ensure fits within working window
        http_response_code(400); echo json_encode(['error' => 'Termin van radnog vremena']); exit; }

    // Check slot free
    $stmt = $conn->prepare("SELECT id FROM bookings WHERE date = ? AND time = ? AND status <> 'canceled'");
    $stmt->bind_param('ss', $date, $time);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) { http_response_code(409); echo json_encode(['error' => 'Termin je zauzet']); exit; }

    // Create
    try {
        $stmt = $conn->prepare('INSERT INTO bookings (service_id, customer_name, customer_phone, date, time, status) VALUES (?, ?, ?, ?, ?, "confirmed")');
        $stmt->bind_param('issss', $service_id, $name, $phone, $date, $time);
        $stmt->execute();
        echo json_encode(['success' => true, 'booking_id' => $stmt->insert_id]);
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() === 1062) { // unique slot
            http_response_code(409);
            echo json_encode(['error' => 'Termin je zauzet']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Greška pri rezervaciji']);
        }
    }
    exit;
}

// Admin mutations: cancel/delete booking
requireLogin();
requireJsonRequest();
$data = readJsonBody();

switch ($method) {
    case 'PATCH':
        $id = sanitizeInput($data['id'] ?? null, 'int');
        $status = sanitizeInput($data['status'] ?? '', 'string');
        if ($id === null || !in_array($status, ['confirmed','canceled','pending'], true)) { http_response_code(400); echo json_encode(['error' => 'Neispravan input']); exit; }
        $stmt = $conn->prepare('UPDATE bookings SET status = ? WHERE id = ?');
        $stmt->bind_param('si', $status, $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        $id = sanitizeInput($data['id'] ?? null, 'int');
        if ($id === null) { http_response_code(400); echo json_encode(['error' => 'id obavezan']); exit; }
        $stmt = $conn->prepare('DELETE FROM bookings WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metoda nije dozvoljena']);
}
