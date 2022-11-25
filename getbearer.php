<?php
//const
require_once("secrets.php");

$baseencodedclient = base64_encode("$client_id:$client_secret");

$postdata = http_build_query(
    array(
        'grant_type' => 'client_credentials'
    )
);
$opts = array('http' =>
    array(
        'method' => 'POST',
        'header' => array(
            'Accept: application/json', 
            'Content-type: application/x-www-form-urlencoded',
            "Authorization: Basic $baseencodedclient"
        ),
        'content' => $postdata
    )
);
$context = stream_context_create($opts);

header("Content-Type: application/json");
if($result = file_get_contents('https://accounts.spotify.com/api/token', false, $context)){
    http_response_code(200);
    echo $result;
}else{
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "bad request"
    ]);
}

?>