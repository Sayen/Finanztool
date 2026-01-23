<?php
session_start([
    'cookie_lifetime' => 86400 * 30,
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
]);

require_once 'db.php';

$pdo = getDB();
if (!$pdo && $_GET['action'] !== 'check') {
    jsonResponse(['error' => 'Database not configured'], 503);
}

if ($pdo) {
    ensureLoginAttemptsTable($pdo);
}

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $input = getJsonInput();
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'];

    // Rate Limiting
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE (email = ? OR ip_address = ?) AND attempted_at > (NOW() - INTERVAL 15 MINUTE)");
    $stmt->execute([$email, $ip]);
    $attempts = $stmt->fetchColumn();

    if ($attempts >= 5) {
        jsonResponse(['error' => 'Too many failed login attempts. Please try again in 15 minutes.'], 429);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['is_admin'] = $user['is_admin'];

        // Update last login
        $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

        $token = generateCsrfToken();

        jsonResponse([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'isAdmin' => (bool)$user['is_admin']
            ],
            'csrfToken' => $token
        ]);
    } else {
        // Log attempt
        $stmt = $pdo->prepare("INSERT INTO login_attempts (ip_address, email) VALUES (?, ?)");
        $stmt->execute([$ip, $email]);

        jsonResponse(['error' => 'Invalid credentials'], 401);
    }
} elseif ($action === 'register') {
    $input = getJsonInput();
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $importData = $input['importData'] ?? null;

    if (strlen($password) < 8) {
        jsonResponse(['error' => 'Password must be at least 8 characters long'], 400);
    }
    if (!preg_match('/[0-9]/', $password)) {
        jsonResponse(['error' => 'Password must contain at least one number'], 400);
    }
    if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
        jsonResponse(['error' => 'Password must contain at least one special character'], 400);
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Email already exists'], 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
        $stmt->execute([$email, $hash]);
        $userId = $pdo->lastInsertId();

        // Handle Import Data if present
        if ($importData) {
            // Budget Configs
            if (!empty($importData['budgetConfigs'])) {
                $stmtBudget = $pdo->prepare("INSERT INTO budget_configs (user_id, config_id, name, content, updated_at) VALUES (?, ?, ?, ?, ?)");
                foreach ($importData['budgetConfigs'] as $config) {
                     $stmtBudget->execute([
                         $userId,
                         $config['id'],
                         $config['name'],
                         json_encode($config), // Store full config object as JSON
                         $config['updatedAt']
                     ]);
                }
            }

            // Scenario Configs
            if (!empty($importData['scenarioConfigs'])) {
                 $stmtScenario = $pdo->prepare("INSERT INTO scenario_configs (user_id, config_id, name, content, updated_at) VALUES (?, ?, ?, ?, ?)");
                 foreach ($importData['scenarioConfigs'] as $config) {
                     $stmtScenario->execute([
                         $userId,
                         $config['id'],
                         $config['name'],
                         json_encode($config),
                         $config['updatedAt']
                     ]);
                 }
            }
        }

        $pdo->commit();

        $_SESSION['user_id'] = $userId;
        $_SESSION['is_admin'] = 0;

        $token = generateCsrfToken();

        jsonResponse([
            'user' => [
                'id' => $userId,
                'email' => $email,
                'isAdmin' => false
            ],
            'csrfToken' => $token
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Registration failed: ' . $e->getMessage()], 500);
    }

} elseif ($action === 'logout') {
    session_destroy();
    jsonResponse(['success' => true]);
} elseif ($action === 'check') {
    if (isset($_SESSION['user_id'])) {
        // Refresh session
        $pdo = getDB();
        if ($pdo) {
             $stmt = $pdo->prepare("SELECT id, email, is_admin FROM users WHERE id = ?");
             $stmt->execute([$_SESSION['user_id']]);
             $user = $stmt->fetch();
             if ($user) {
                 $token = generateCsrfToken();
                 jsonResponse([
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'isAdmin' => (bool)$user['is_admin']
                    ],
                    'csrfToken' => $token
                ]);
             }
        }
    }
    jsonResponse(['user' => null]);
}
