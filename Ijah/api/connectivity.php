<?php
  /* change list : aamilham
  1. change isset to !empty
  2. change if else to switch case
  3. change array() to []
  4. change $row array to more good syntax */

  include 'init.php';

  // Check if the database connection is successful
  if (!$link) {
    error_log("Database connection failed: " . pg_last_error());
    echo json_encode(["error" => "Database connection failed"]);
    exit;
  }

  echo json_encode(["success" => "Database connected successfully"]);


  $postdata = file_get_contents("php://input");
  // Debugging: Log raw input data
  error_log("Raw input data: " . $postdata);

  $requestList = json_decode($postdata, true);

  // Check if JSON decoding worked
  if (is_null($requestList)) {
    error_log("JSON decoding failed. Raw input data was: " . $postdata);
    echo json_encode(["error" => "Invalid JSON input"]);
    exit;
}

  $condArr = [];
  $comIdArr = [];
  $proIdArr = [];
  $table = 'ERROR_UNKNOWN_TABLE_PLEASE_FIX';
  $mode = '';

  foreach($requestList as $req) {
    if (!empty($req['value'])) {
      $mode = 'SEARCH_ONLY';
      $val = $req['value'];

      $id = '';
      switch (true) {
        case str_contains($val, 'PLA'):
            $id = 'pla_id';
            $table = 'plant_vs_compound';
            break;
        case str_contains($val, 'COM'):
            $id = 'com_id';
            $table = 'plant_vs_compound';
            break;
        case str_contains($val, 'PRO'):
            $id = 'pro_id';
            $table = 'protein_vs_disease';
            break;
        case str_contains($val, 'DIS'):
            $id = 'dis_id';
            $table = 'protein_vs_disease';
            break;
      }

      $condArr[] = "$id = '$val'";
    }
    elseif (!empty($req['comId']) && !empty($req['proId']) ) {
      $mode = 'SEARCH_AND_PREDICT';
      $comId = $req['comId'];
      $proId = $req['proId'];

      $comIdArr[] = $comId;
      $proIdArr[] = $proId;

      $condArr[] = "(com_id= '$comId' AND pro_id= '$proId')";
      $table = 'compound_vs_protein';
    }
    elseif (!empty($req['comId']) ) {
      $mode = 'SEARCH_ONLY';
      $table = 'compound_vs_protein';
      $condArr[] = "com_id= '{$req['comId']}'";
    }
    elseif (!empty($req['proId']) ) {
      $mode = 'SEARCH_ONLY';
      $table = 'compound_vs_protein';
      $condArr[] = "pro_id= '{$req['proId']}'";
    }
    elseif(!empty($req['id']) ) {// this is for download all connectivity data
      $val = $req['id'];
      $mode = 'SEARCH_ONLY';

      switch ($val) {
        case 'PLA_VS_COM_ALL_ROWS':
            $table = 'plant_vs_compound';
            break;
        case 'COM_VS_PRO_ALL_ROWS':
            $table = 'compound_vs_protein';
            break;
        case 'PRO_VS_DIS_ALL_ROWS':
            $table = 'protein_vs_disease';
            break;
      }
      $condArr[] = 'TRUE';
      break;
    }
  }

  $respArr = [];
  $condArrLen = count($condArr);


  //aamilham note : i dont know what this for and work
  for($i = 0; $i < $condArrLen; $i++) {
    // Construct the query
    $condStr = '';
    if ($mode==='SEARCH_ONLY') {// Merge the condition NOW
      for($j = 0; $j < $condArrLen; $j++) {
        $condStr = $condStr.$condArr[$j];
        if ($j<$condArrLen-1) {
          $condStr = $condStr.' OR ';
        }
      }
    }
    elseif ($mode==='SEARCH_AND_PREDICT') {
      $condStr = $condArr[$i];
    }
    $query = "SELECT * FROM $table WHERE $condStr";

    // Execute the query
    $resp = pg_query($link, $query);
    if (!$resp) {
      error_log("Query failed: " . pg_last_error($link));
      continue;
    }

    $respLen = pg_num_rows($resp);

    if ($respLen===0 && $mode==='SEARCH_AND_PREDICT') {
      $row = [
          'com_id' => $comIdArr[$i],
          'pro_id' => $proIdArr[$i],
          'weight' => null,
          'source' => null,
          'timestamp' => null
      ];
      $respArr[] = $row;
    } else {
        while($row = pg_fetch_assoc($resp)){
        $respArr[] = $row;
      }
    }

    if ($mode==='SEARCH_ONLY') {// we have merged, so need one iter only
      break;
    }
  }

  // Set JSON header and return response
  header('Content-Type: application/json');
  echo json_encode($respArr);
?>
