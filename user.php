<?php

session_start();

if(isset($_GET["code"])){
    $code = $_GET["code"];
    $redirect_uri = $_GET["redirect_uri"];
    
    $userbearer = false;

    //const
    require_once("secrets.php");

    $baseencodedclient = base64_encode("$client_id:$client_secret");

    $postdata = http_build_query(
        array(
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $redirect_uri
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

    if($result = file_get_contents('https://accounts.spotify.com/api/token', false, $context)){
        $userbearer = json_decode($result, true)["access_token"];
        $_SESSION["bearer"] = $userbearer;
    }else{
        echo "failed to do request...";
        exit();
    }
    header("Location: user.php");
    exit();
}

$userbearer = $_SESSION["bearer"];

function getuserinfo(){
    global $userbearer;
    $opts = array( 'http' =>
        array(
            'method' => 'GET',
            'header' => array(
                "Accept: application/json",
                "Content-Type: application/json",
                "Authorization: Bearer $userbearer"
            )
        )
    );
    $context = stream_context_create($opts);
    $userdata = file_get_contents('https://api.spotify.com/v1/me', false, $context);
    $userdata = json_decode($userdata, true);
    return $userdata;
}

function gettrackinfo($trackid){
    global $userbearer;
    $opts = array( 'http' =>
        array(
        'method' => 'GET',
        'header' => array(
            "Accept: application/json",
            "Authorization: Bearer $userbearer"
            )
        )
    );
    $context = stream_context_create($opts);
    $result = file_get_contents("https://api.spotify.com/v1/tracks/$trackid", false, $context);
    $result = json_decode($result, true);
    return $result;
};

//actual output
$userdata = getuserinfo();

?>

<!DOCTYPE html>

<html>

<head>
    <meta charset="utf8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="bootstrap.min.css">
    <script src="bootstrap.bundle.min.js"></script>
    <script src="dynamics.js"></script>

    <script>
        accesstoken = "<?= $userbearer ?>"; //set accesstoken also in javascript
        userid = "<?= $userdata["id"] ?>"; //set userid also in javascript

        document.addEventListener("DOMContentLoaded", function(event){
            getuserplaylists();
        })
    </script>

    <title>Cebify</title>
</head>

<body>
    <nav class="navbar bg-light">
        <div class="container-fluid">
            <span class="navbar-brand mb-0 h1">Cebify</span>
            <div class="d-flex">
                <?php 
                    echo "<span>$userdata[display_name]</span>";
                ?>
                <!--<button onclick="spotifylogin();" class="btn btn-sm btn-outline-success">Login</button>-->
            </div>
        </div>
    </nav>
    <div id="maincontainer" class="container mt-5">

<?php
    require("dbconnect.php");

    $dbusers = $dbc->query("SELECT * FROM users WHERE $userdata[id];");
    if($dbusers->fetch_assoc()["id"]){
        echo "<div class='alert alert-primary'>
            <h5>Steuerung:</h5>
            <div class='input-group input-group-sm w-25 mb-1'>
            <input class='form-control form-control-sm' type='text' id='playlistname' name='playlistname' placeholder='Playlistname...'>
            <button id='createplbutton' class='btn btn-sm btn-primary' onclick='createplaylist()'>Partyliste anlegen</button>
            </div>
            <div class='input-group input-group-sm w-50'>
            <span class='input-group-text'>gewählte Playlist: </span>
            <select id='userplaylists' class='form-select'></select>
            <button class='btn btn-sm btn-outline-primary' onclick='getuserplaylists(lastplaylistoffset-50);'>-50</button>
            <button class='btn btn-sm btn-outline-primary' onclick='getuserplaylists(lastplaylistoffset+50);'>+50</button>
            </div>
        </div>";


        $collections = $dbc->query("SELECT * FROM `collection`;");
    
        echo "<div class='p-2'>";
        foreach($collections as $collection){
            $tracks = $dbc->query("SELECT * FROM tracks WHERE `collection` = $collection[id] ORDER BY `order`;");
            echo "<script>";
            echo "var collection_$collection[id] = " . json_encode($tracks->fetch_all()) . ";";
            echo "</script>";
            echo "<h5>Sammlung von $collection[name]</h5>";
            echo "<div class=' mb-1 input-group input-group-sm'><button class='btn btn-sm btn-success' onclick=\"savetoplaylist(this, collection_$collection[id], document.getElementById('userplaylists').options[document.getElementById('userplaylists').selectedIndex].value);\">in Partyliste speichern</button></div>";
            echo "<p class='alert alert-secondary'>Kommentar:<br>$collection[comment]</p>";
            echo "<ul>";
            foreach($tracks as $track){
                //takes too long
                //echo '<li><iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/'.$track["trackid"].'?utm_source=generator" width="50%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></li>';
                echo "<li><a target='_blank' href='https://open.spotify.com/track/$track[trackid]'>" . $track["trackname"] . "</a></li>";
            }
            echo "</ul>";
        }
        echo "</div>";
    }else{
        echo "nicht in der Liste der User...";
    }

?>

    </div>
</body>

</html>