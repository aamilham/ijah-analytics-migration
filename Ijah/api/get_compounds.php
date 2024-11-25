<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'init.php';

try {
    $query = "SELECT com_id as id, COALESCE(com_drugbank_id, com_knapsack_id, com_kegg_id, com_pubchem_id, com_cas_id) as name FROM compound ORDER BY name";
    $result = pg_query($link, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($link));
    }
    
    $compounds = array();
    while ($row = pg_fetch_assoc($result)) {
        $compounds[] = $row;
    }
    
    echo json_encode($compounds);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
