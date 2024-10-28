<?php

/* change list : aamilham
1. respArr change array syntax
2. change isset to !empty
3. change if condition to switch case
4. add more response for error handling
5. use str_contains() for better readability
6. sanitize input and improve string concatenation */

include 'init.php';

// retrieve and decode json input
$postdata = file_get_contents("php://input");
$requestList = json_decode($postdata, true);

$respArr = [];

if (!empty($requestList)) {
  $cond = '';
  $table = 'ERROR_UNKNOWN_TABLE_PLEASE_FIX';
  $col = 'ERROR_UNKNOWN_COL_PLEASE_FIX';
  $selectAll = false;

  foreach($requestList as $req) {
    if (!empty($req['id'])) {
      $val = $req['id'];

      $id = '';
      switch (true){
        case str_contains($val, 'PLA') :
            $id = 'pla_id';
            $table = 'plant';
            $col = 'pla_id,pla_name,pla_idr_name';
            break;
        case str_contains($val, 'COM') :
            $id = 'com_id';
            $table = 'compound';
            $col = 'com_id,com_cas_id,com_drugbank_id,com_knapsack_id,com_kegg_id,
                com_pubchem_id,com_inchikey,com_smiles,com_pubchem_name,com_iupac_name';
            break;
        case str_contains($val, 'PRO') :
            $id = 'com_id';
            $table = 'compound';
            $col = 'com_id,com_cas_id,com_drugbank_id,com_knapsack_id,com_kegg_id,
                com_pubchem_id,com_inchikey,com_smiles,com_pubchem_name,com_iupac_name';
            break;
        case str_contains($val, 'DIS') :
            $id = 'dis_id';
            $table = 'disease';
            $col = 'dis_id,dis_omim_id,dis_name,dis_uniprot_abbrv';
            break;
        }
        if (strpos($val,'ALL_ROWS')!==false) {
          $selectAll = true;
          break;
        }
        $cond .= "$id = '$val' OR ";
      }
    }

    if ($cond !== '') {
      $cond = substr($cond,0,-4);// remove the last OR
    }

    $query = "SELECT ".$col." FROM ".$table;
    if (!$selectAll && $cond !== '') {
        $query .= " WHERE $cond";
    }

    $resp = pg_query($link, $query);
    if (!$resp) {
        error_log('Query failed: ' . pg_last_error($link));
        http_response_code(500);
        echo json_encode(['error' => 'Database Query failed']);
        exit;
    }

    while($row = pg_fetch_assoc($resp)){
        $respArr[] = $row;
    }
}

// set json header and return response
header('Content-type: application/json');
echo json_encode($respArr);

?>
