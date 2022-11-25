<!DOCTYPE html>

<html>

<head>
    <meta charset="utf8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="bootstrap.min.css">
    <script src="bootstrap.bundle.min.js"></script>
    <script src="dynamics.js"></script>

    <title>Cebify</title>
</head>

<body>
    <nav class="navbar bg-light">
        <div class="container-fluid">
            <span class="navbar-brand mb-0 h1">Cebify</span>
            <div class="d-flex">
                <button onclick="spotifylogin();" class="btn btn-sm btn-outline-success">Login</button>
            </div>
        </div>
    </nav>
    <div id="maincontainer" class="container mt-5">
        <h1>Hallo!</h1>

        <p class="">
            <span class="fs-4">Wähle einen oder mehrere Tracks von Spotify aus, um sie an redacted und redacted zu schicken!</span>
            <br><br>
            Dazu rechts das Suchfeld benutzen.
            <br>
            Es können Alben (💿), Künstler (🧑) und Tracks (🎵) gefunden werden.
            Nach dem Eingeben eines Suchbegriffs kann nach o.g. Typen gefiltert werden.
            <br>
            Ein Klick auf den Namen eines Albums oder Künstlers öffnet die Trackübersicht.
            <br>
            Ein Klick auf den Namen eines Tracks öffnet den Track in Spotify.
            <br>
            <br>
            Setze bei Tracks einen Haken in das Kontrollfeld, um den Track zur Auswahl hinzuzufügen.
        </p>

        <form class="float-start w-50 p-2 mb-2" id="personaldata" action="handler.php" method="post" onsubmit="savedata(document.getElementById('selection')); return false;">
            <h3>Deine Infos.</h3>
            <input class="form-control form-control-sm" type="text" name="name" placeholder="dein Name" required>
            <br>
            <textarea class="form-control form-control-sm mb-3" name="comment" placeholder="ein Kommentar..." data-changed="false"></textarea>
            <button class="btn btn-sm btn-primary" type="submit" name="save" onclick="savedata(this.form, document.getElementById('selection')); return false;">Song-Auswahl senden</button>
            <h4 class="mt-2">Deine bisherige Auswahl:</h4>
            <ul class="mt-2" id="selectionList"></ul>
        </form>

        <div class="float-end w-50 p-2 mb-2">
            <h3>Deine Song-Auswahl.</h3>
            <div class="input-group input-group-sm mb-3">
                <input class="form-control form-control-sm" type="search" onkeyup="if(event.keyCode == 13) searchspotify(this.value)" placeholder="etwas eingeben + ENTER">
                <button class="btn btn-sm btn-secondary" type="button" onclick="searchspotify(this.previousElementSibling.value); return false;">🔍</button>
            </div>
            <br><br>
            <form id="selection" action="" method="post">
                <ul id="resultList"></ul>
            </form>
        </div>

    </div>
</body>

</html>