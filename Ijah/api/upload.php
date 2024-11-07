<?php

  /* change list : aamilham
  1. change phpmailer path and version
  2. add sanitize input for preventing SQL injection
  3. simpler the query
  4. update query execute & ack response */

  include 'init.php';
  require_once 'vendor/autoload.php';

  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\Exception;

  //retreive and decode json input
  $postdata = file_get_contents("php://input");
  $req = json_decode($postdata, true);

  //sanitize inputs for preventing SQL injection
  $type = pg_escape_string($link, $req['type']);
  $data = pg_escape_string($link, $req['data']);
  $description = pg_escape_string($link, $req['description']);
  $publication_detail = pg_escape_string($link, $req['publication_detail']);
  $name = pg_escape_string($link, $req['name']);
  $email = pg_escape_string($link, $req['email']);
  $aff = pg_escape_string($link, $req['affiliation']);

  //construct the SQL query
  $query = $query = "INSERT INTO user_upload (type, data, description, name, email, affiliation, publication_detail) VALUES ('$type', '$data', '$description', '$name', '$email', '$aff', '$publication_detail')";

  //execute the query
  $resp = pg_query($link, $query);
  if(!$resp) {
    error_log('Query failed: ' . pg_last_error($link));
    http_response_code(500);
    echo json_encode(['ack' => 'ERROR', 'message' => 'Database insertion failed']);
    exit;
  }

  //respond with ack
  header('Content-type: application/json');
  echo json_encode(['ack' => 'OK']);
?>
