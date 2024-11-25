<?php
header('Content-Type: application/json');
require_once 'cors_header.php';
require_once 'init.php';

try {
    $query = "SELECT pro_id as id, pro_name as name FROM protein ORDER BY pro_name";
    $result = pg_query($link, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($link));
    }
    
    $proteins = array();
    while ($row = pg_fetch_assoc($result)) {
        $proteins[] = $row;
    }
    
    echo json_encode($proteins);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
