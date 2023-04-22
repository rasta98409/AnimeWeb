<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With');

$video_url = $_GET['url'];
if (!empty($video_url)) {
  echo file_get_contents($video_url);
} else {
  echo 'URL no válida';
}
?>