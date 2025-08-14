<?php
require_once __DIR__ . '/../database/cors.php';
require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/../utils/security.php';

// Inputs: date=YYYY-MM-DD
$date = parseDateStrict(sanitizeInput($_GET['date'] ?? '', 'string'));
if ($date === null) {
    http_response_code(400);
    echo json_encode(['error' => 'date je obavezan (YYYY-MM-DD)']);
    exit;
}

// Check day off
$stmt = $conn->prepare('SELECT 1 FROM days_off WHERE date = ?');
$stmt->bind_param('s', $date);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['date' => $date, 'slots' => []]);
    exit;
}

// Determine weekday (1..7, Monday=1)
$weekday = (int)(new DateTime($date, appTimezone()))->format('N');
$stmt = $conn->prepare('SELECT start_time, end_time FROM working_hours WHERE day_of_week = ?');
$stmt->bind_param('i', $weekday);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    echo json_encode(['date' => $date, 'slots' => []]);
    exit;
}
$row = $res->fetch_assoc();
$start = $row['start_time'];
$end = $row['end_time'];

// Read slot interval from settings (default 60)
$interval = 60;
$resInterval = $conn->query("SELECT `value` FROM settings WHERE `key`='slot_interval_minutes' LIMIT 1");
if ($resInterval && $resInterval->num_rows > 0) {
    $rowi = $resInterval->fetch_assoc();
    $iv = (int)($rowi['value'] ?? 60);
    if ($iv > 0) { $interval = $iv; }
}

// Generate interval-based slots aligned to interval grid (TZ-aware)
$tz = appTimezone();
$slots = [];
$startDt = DateTime::createFromFormat('Y-m-d H:i:s', "$date $start", $tz);
$endDt = DateTime::createFromFormat('Y-m-d H:i:s', "$date $end", $tz);
$midnight = DateTime::createFromFormat('Y-m-d H:i:s', "$date 00:00:00", $tz);
if ($startDt && $endDt && $midnight) {
    $startTs = $startDt->getTimestamp();
    $endTs = $endDt->getTimestamp();
    $midTs = $midnight->getTimestamp();
    $step = $interval * 60;
    $offset = ($startTs - $midTs) % $step;
    $cursor = $offset === 0 ? $startTs : $startTs + ($step - $offset);
    while ($cursor + $step <= $endTs) {
        $slots[] = (new DateTime('@' . $cursor))->setTimezone($tz)->format('H:i:s');
        $cursor += $step;
    }
}

// Read booked times for that date
$stmt = $conn->prepare("SELECT time FROM bookings WHERE date = ? AND status <> 'canceled'");
$stmt->bind_param('s', $date);
$stmt->execute();
$booked = array_map(function($r){ return $r['time']; }, $stmt->get_result()->fetch_all(MYSQLI_ASSOC));

// Filter free slots
$free = array_values(array_diff($slots, $booked));

echo json_encode(['date' => $date, 'slots' => $free]);
