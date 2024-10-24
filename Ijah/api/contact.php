<?php

  /* change list : aamilham
  1. change phpmailer path and version
  2. add sanitize input for preventing SQL injection
  3. simpler the query
  4. change mail to try catch syntax */
  
  include 'init.php';
  require_once 'vendor/autoload.php';

  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\Exception;

  //retreive and decode json input
  $postdata = file_get_contents("php://input");
  $req = json_decode($postdata, true);

  //sanitize input for preventing SQL injection
  $name = pg_escape_string($link, $req['name']);
  $email = pg_escape_string($link, $req['email']);
  $aff = pg_escape_string($link, $req['affiliation']);
  $sbj = pg_escape_string($link, $req['subject']);
  $msg = pg_escape_string($link, $req['message']);

  //construct the SQL query
  $query = "INSERT INTO user_msg (name, email, affiliation, subject, msg) VALUES ('$name', '$email', '$aff', '$sbj', '$msg')";

  //execute the query
  $resp = pg_query($link, $query);

  if (!$resp) {
    error_log('Query failed: ' . pg_last_error($link));
    http_response_code(500);
    echo json_encode(['ack' => 'ERROR', 'message' => 'Database insertion failed']);
    exit;
  }

  header('Content-type: application/json');
  echo json_encode(['ack' => 'OK']);

  $mail = new PHPMailer(true);


try {
  $mail->SMTPDebug = 3; // enable SMTP debug
  $mail->isSMTP(); // set PHPMailer to use SMTP
  // $mail->Host = 'tls://smtp.gmail.com:587'; // GMail's SMTP hostname -> use this if error happened with SSL
  $mail->Host = 'smtp.gmail.com'; // GMail's SMTP hostname
  $mail->SMTPAuth = true;
  $mail->Username = $ijahMail;
  $mail->Password = $ijahMailPass;
  $mail->SMTPSecure = 'ssl'; // setting TLS encryption (GMail needs this)
  $mail->Port = 465; // TCP port to connect, 465 for SSL, 587 for TLS

  // Recipients
  $mail->setFrom('ijahweb@gmail.com', 'Ijah Webserver');
  $mail->addAddress('vektor.dewanto@gmail.com');
  $mail->addCC('hzbarkan@gmail.com');
  $mail->addCC('w.ananta.kusuma@gmail.com');

  // Content
  $mail->isHTML(false);

  $mail->Subject = "ijahws: user-message: {$email}";
  $mail->Body    = "Name: {$name} \nE-mail: {$email} \nAffiliation: {$aff} \nFeedback Type: {$sbj} \n\nMessage: \n {$msg}";

  $mail->send;
  echo 'Message has been sent.';
  } catch (Exception $e) {
    error_log('Message could not be sent. Mailer Error: ' . $mail->ErrorInfo);
    echo 'message could not be sent';
  }
    

?>
