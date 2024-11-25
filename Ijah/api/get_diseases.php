<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'init.php';

try {
    $query = "SELECT dis_id as id, dis_name as name FROM disease ORDER BY dis_name";
    $result = pg_query($link, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($link));
    }
    
    $diseases = array();
    while ($row = pg_fetch_assoc($result)) {
        $diseases[] = $row;
    }
    
    echo json_encode($diseases);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
