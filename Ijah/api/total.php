<?php

    /* change list : aamilham
    1. add error log for query failed
    2. add http response code for query failed
    3. change syntax for query array row */

  include 'init.php';

  //execute query
  $query = pg_query($link, 'SELECT * FROM total_view');
  if(!$query){
    error_log('Query failed: ' . pg_last_error($link));
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed']);
    exit;
  }

  //fetching all rows from the query
  $array = pg_fetch_all($query) ?: [];

  // set json header and return response
  header('Content-type: application/json');
  echo json_encode($array, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);

?>
