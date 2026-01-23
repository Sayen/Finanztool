<?php
session_start();
require_once 'db.php';

$pdo = getDB();
if (!$pdo) {
    jsonResponse(['error' => 'Database not configured'], 503);
}

if (!isset($_SESSION['user_id'])) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

function ensureSettingsTable($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS app_settings (
            key_name VARCHAR(50) PRIMARY KEY,
            value VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB;
    ");
}

ensureSettingsTable($pdo);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT key_name, value FROM app_settings");
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // Defaults
    $defaults = [
        'nodePadding' => '5',
        'minHeight' => '600',
        'heightPerNode' => '35'
    ];

    $settings = array_merge($defaults, $rows);

    // Cast to integers
    foreach ($settings as $k => $v) {
        if (is_numeric($v)) {
            $settings[$k] = (int)$v;
        }
    }

    jsonResponse($settings);
} elseif ($method === 'POST') {
    if (empty($_SESSION['is_admin'])) {
        jsonResponse(['error' => 'Forbidden'], 403);
    }

    verifyCsrfToken();
    $input = getJsonInput();

    // Whitelist allowed settings
    $allowed = ['nodePadding', 'minHeight', 'heightPerNode'];

    $stmt = $pdo->prepare("INSERT INTO app_settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?");

    foreach ($input as $key => $value) {
        if (in_array($key, $allowed)) {
            $stmt->execute([$key, $value, $value]);
        }
    }

    jsonResponse(['success' => true]);
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
