<?php
session_start();
require_once 'db.php';

$pdo = getDB();
if (!$pdo) {
    jsonResponse(['error' => 'Database not configured'], 503);
}

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    jsonResponse(['error' => 'Forbidden'], 403);
}

$action = $_GET['action'] ?? 'stats';

if ($action === 'stats') {
    // Basic stats
    $stats = [];

    // User count
    $stats['userCount'] = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

    // Budget Configs count
    $stats['budgetCount'] = $pdo->query("SELECT COUNT(*) FROM budget_configs")->fetchColumn();

    // Scenario Configs count
    $stats['scenarioCount'] = $pdo->query("SELECT COUNT(*) FROM scenario_configs")->fetchColumn();

    // Active users (last 30 days) - Requires last_login column
    // We added last_login update in auth.php
    $stats['activeUsers'] = $pdo->query("SELECT COUNT(*) FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();

    // Chart data: Registrations per month (last 12 months)
    $stmt = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
        FROM users
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month ASC
    ");
    $stats['registrations'] = $stmt->fetchAll();

    jsonResponse($stats);

} elseif ($action === 'users') {
    $stmt = $pdo->query("SELECT id, email, is_admin, created_at, last_login FROM users ORDER BY created_at DESC");
    jsonResponse($stmt->fetchAll());

} elseif ($action === 'delete_user') {
    verifyCsrfToken();
    $input = getJsonInput();
    $id = $input['id'] ?? 0;

    if ($id == $_SESSION['user_id']) {
        jsonResponse(['error' => 'Cannot delete yourself'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);

} elseif ($action === 'reset_password') {
    verifyCsrfToken();
    $input = getJsonInput();
    $id = $input['id'] ?? 0;
    $newPass = $input['password'] ?? '';

    if (strlen($newPass) < 8) {
        jsonResponse(['error' => 'Password must be at least 8 characters long'], 400);
    }
    if (!preg_match('/[0-9]/', $newPass)) {
        jsonResponse(['error' => 'Password must contain at least one number'], 400);
    }
    if (!preg_match('/[A-Z]/', $newPass)) {
        jsonResponse(['error' => 'Password must contain at least one uppercase letter'], 400);
    }
    if (!preg_match('/[a-z]/', $newPass)) {
        jsonResponse(['error' => 'Password must contain at least one lowercase letter'], 400);
    }
    if (!preg_match('/[^a-zA-Z0-9]/', $newPass)) {
        jsonResponse(['error' => 'Password must contain at least one special character'], 400);
    }

    $hash = password_hash($newPass, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$hash, $id]);
    jsonResponse(['success' => true]);
}
