<?php


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
  header('Access-Control-Allow-Headers: token, Content-Type, Authorization');
  header('Access-Control-Max-Age: 1728000');
  header('Content-Length: 0');
  header('Content-Type: text/plain');
  die();
}

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$all_headers = getallheaders();
$post_body = file_get_contents('php://input');
$proxy_path = $_REQUEST['proxy_path'];
$method = $_SERVER['REQUEST_METHOD'];

$http_headers = [];
foreach ($all_headers as $key => $value) {
  $http_headers[] = $key . ': ' . $value;
}

// var_dump(['url' => $url, 'query_string' => $query_string, 'proxy_path' => $proxy_path]);
// var_dump([$_GET]);

$url = 'http://localhost:21104/' . $proxy_path;

$qpos = strpos($proxy_path, '?');
if ($qpos !== false) {
  $path = substr($proxy_path, 0, $qpos);
  $query = substr($proxy_path, $qpos + 1);
  parse_str($query, $obj_query);
  $query_params = http_build_query($obj_query);
  
  // var_dump([
  //   'query' => $query,
  //   'obj_query' => $obj_query,
  //   'params' => $query_params,
  // ]);

  $url = 'http://localhost:21104/' . $path . '?' . $query_params;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $http_headers);
curl_setopt($ch, CURLOPT_URL, $url);

if ($method == 'POST') {
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $post_body);
}
if ($method == 'DELETE') {
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
}

$response = curl_exec($ch);
curl_close($ch);

echo $response;

?>