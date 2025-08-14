<?php
require_once __DIR__ . '/../database/cors.php';
require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/session.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    requireLogin();
    $res = $conn->query('SELECT id, day_of_week, start_time, end_time FROM working_hours ORDER BY day_of_week');
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
    exit;
}

requireLogin();
requireJsonRequest();
$data = readJsonBody();

switch ($method) {
    case 'POST': // create or replace for a day
        $day = sanitizeInput($data['day_of_week'] ?? null, 'int');
        $start = sanitizeInput($data['start_time'] ?? '', 'string');
        $end = sanitizeInput($data['end_time'] ?? '', 'string');
        if ($day === null || $start === '' || $end === '') {
            http_response_code(400);
            echo json_encode(['error' => 'day_of_week, start_time, end_time su obavezni']);
            exit;
        }
        // upsert by day_of_week
        $stmt = $conn->prepare('INSERT INTO working_hours (day_of_week, start_time, end_time) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE start_time=VALUES(start_time), end_time=VALUES(end_time)');
        $stmt->bind_param('iss', $day, $start, $end);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    case 'DELETE': // clear a day
        $day = sanitizeInput($data['day_of_week'] ?? null, 'int');
        if ($day === null) { http_response_code(400); echo json_encode(['error' => 'day_of_week obavezan']); exit; }
        $stmt = $conn->prepare('DELETE FROM working_hours WHERE day_of_week = ?');
        $stmt->bind_param('i', $day);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metoda nije dozvoljena']);
}
