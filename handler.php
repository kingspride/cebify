<?php
    function get_json_from_post(){
        try{
            $parsed_json = json_decode(file_get_contents("php://input"), true);
            return $parsed_json;
        }catch(Exception $e){
            return false;
        }
    }

    $data = get_json_from_post();
    error_log(print_r($data, true));

    if(!$data){
        http_response_code(400);
        $status = [
            "status" => "error",
            "message" => "could not read json data"
        ];
        echo json_decode($status);
        exit();
    }
    
    require("dbconnect.php");

    $stmt = $dbc->prepare("INSERT INTO `collection` (name, comment) VALUES (?, ?);");
    $stmt->bind_param("ss", $data["name"], $data["comment"]);
    $stmt->execute();

    $lastid = $dbc->insert_id;

    $stmt2 = $dbc->prepare("INSERT INTO `tracks` (collection, trackid, trackname) VALUES (?, ?, ?);");
    foreach($data["trackid[]"] as $index=>$trackid){
        //error_log($lastid . $trackid . $data["trackname[]"][$index]);
        $stmt2->bind_param("sss", $lastid, $trackid, $data["trackname[]"][$index]);
        $stmt2->execute();
    }

    $status = ["status" => "success"];

    header("Content-Type: application/json");

    echo json_encode($status);
?>