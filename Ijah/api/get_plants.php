<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'init.php';

try {
    $query = "SELECT pla_id as id, pla_name as name FROM plant ORDER BY pla_name";
    $result = pg_query($link, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($link));
    }
    
    $plants = array();
    while ($row = pg_fetch_assoc($result)) {
        $plants[] = $row;
    }
    
    echo json_encode($plants);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
