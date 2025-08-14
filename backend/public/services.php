<?php
require_once __DIR__ . '/../database/cors.php';
require_once __DIR__ . '/../database/db.php';

// Public list of active services
$res = $conn->query('SELECT id, name, price, duration_minutes FROM services WHERE active=1 ORDER BY name');
$rows = [];
while ($row = $res->fetch_assoc()) $rows[] = $row;
echo json_encode($rows);
