<?php
header('Content-Type: application/json');
require_once 'init.php';

try {
    if (!$link) {
        throw new Exception("Database connection failed: " . pg_last_error());
    }
    
    // Try a simple query
    $result = pg_query($link, "SELECT 1");
    if (!$result) {
        throw new Exception("Query failed: " . pg_last_error($link));
    }
    
    echo json_encode([
        "status" => "success",
        "message" => "Database connection successful",
        "database_info" => [
            "host" => $dbConfig['host'],
            "database" => $dbConfig['database'],
            "user" => $dbConfig['user']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
