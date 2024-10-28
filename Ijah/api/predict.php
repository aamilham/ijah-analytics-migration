<?php

/*   change list : aamilham
  1. change array syntax
  2. add !empty to request listener function
  3. add more response for error handling
  4. change foreach to array_map */

  include 'init.php';

  // retrieve and decode json input
  $postdata = file_get_contents("php://input");
  $requestList = json_decode($postdata, true);

  $respArr = [];

  if (!empty($requestList)) {
    // Socket To predictor load balancer (LB)
    $socketToLB = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
    if ($socketToLB === false){
      error_log("socket_create() failed: " .  socket_strerror(socket_last_error()));
      http_response_code(500);
      echo json_encode(['error' => 'Failed to create socket']);
      exit;
    }

    $result = socket_connect($socketToLB, $predictorChannelHost, $predictorChannelPort);
    if ($result === false){
        error_log("socket_connect() failed: " . socket_strerror(socket_last_error($socketToLB)));
        http_response_code(500);
        echo json_encode(['error' => 'Failed to connect to predictor load balancer']);
        exit;
    }

    // Send messages to predictor load balancer
    $msgTo = array_map(fn($req) => $req['comId'] . ":" . $req['proId'], $requestList);
    $msgTo = implode(",", $msgTo) . "|end";
    

    socket_write($socketToLB, $msgTo, strlen($msgTo));
    socket_close($socketToLB);

    // sleep for some integer seconds, waiting for DB update by predictors
    sleep( (int) $timeToWait );
    $respArr[] = ['has_waited_for' => $timeToWait];
  }
  else {
    $respArr[] = ['has_waited_for' => 0];
  }

  // set json header and return response
  header('Content-type: application/json');
  echo json_encode($respArr);

?>
