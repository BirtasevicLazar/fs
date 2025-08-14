<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/cors.php';

// Simple migration script to create tables if they don't exist

function respond($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

try {
    // Users table for admin login (single barber admin for now)
    $conn->query("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Services
    $conn->query("CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        duration_minutes INT NOT NULL DEFAULT 60,
        active TINYINT(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Working hours by weekday (1=Mon..7=Sun)
    $conn->query("CREATE TABLE IF NOT EXISTS working_hours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        day_of_week TINYINT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        UNIQUE KEY uniq_day (day_of_week)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Days off / holidays
    $conn->query("CREATE TABLE IF NOT EXISTS days_off (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        reason VARCHAR(255) NULL,
        UNIQUE KEY uniq_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Bookings
    $conn->query("CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status ENUM('pending','confirmed','canceled') NOT NULL DEFAULT 'confirmed',
        notes VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_slot (date, time),
        INDEX idx_service_date (service_id, date),
        CONSTRAINT fk_booking_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Settings (key-value) for configurable options like slot interval
    $conn->query("CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `key` VARCHAR(100) NOT NULL,
        `value` VARCHAR(255) NOT NULL,
        UNIQUE KEY uniq_key (`key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Ensure default slot interval is 60 minutes
    $conn->query("INSERT INTO settings (`key`, `value`) VALUES ('slot_interval_minutes', '60') ON DUPLICATE KEY UPDATE value = value");

    // Generic rate_limiting table already created on the fly in security.php if needed

    respond(['success' => true, 'message' => 'Migrations applied']);
} catch (Exception $e) {
    respond(['success' => false, 'error' => $e->getMessage()], 500);
}
