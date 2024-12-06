<?php
// Include CORS headers
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

header('Content-Type: application/json');

try {
    $host = "localhost";
    $dbname = "ijahdatabase";
    $user = "postgres";
    $password = "Freedom255";

    $connStr = "host=$host dbname=$dbname user=$user password=$password";
    $conn = pg_connect($connStr);
    if (!$conn) {
        throw new Exception('Database connection failed: ' . pg_last_error());
    }

    // Using dis_name as the name field
    $result = pg_query($conn, "SELECT dis_name AS name FROM disease WHERE dis_name IS NOT NULL ORDER BY dis_name");
    if (!$result) {
        throw new Exception('Query failed: ' . pg_last_error($conn));
    }

    $data = [];
    while ($row = pg_fetch_assoc($result)) {
        if (!empty($row['name'])) {
            $data[] = $row;
        }
    }

    echo json_encode($data);
    pg_close($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
