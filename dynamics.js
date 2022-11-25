function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const api_url = "https://api.spotify.com/v1";
const client_id = "e216ff99b9a44be38855e9aa3d33604b";
const state = makeid(16);
const bchannel = new BroadcastChannel("spotifylogin");

var accesstoken = "";
var loginaccesscode = ""; //will be written by login popup window

var songselection = {};

bchannel.addEventListener("message", m => {
    console.log(m.data);
    if(m.data == "getstate?"){
        bchannel.postMessage({state: state});
    }
    if(m.data.loginaccesscode !== undefined){
        loginaccesscode = m.data.loginaccesscode;
        window.location.href = "user.php?code=" + loginaccesscode + "&redirect_uri=" + window.location.protocol + "//" + window.location.host + window.location.pathname + "callback.html";
    }
});

/*function getuseraccesstoken(){
    let xhr = new XMLHttpRequest();
    //xhr.open("POST", "https://accounts.spotify.com/api/token");
    xhr.open("POST", "getuserbearer.php");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //var baseencodedclientdata = btoa(client_id + ":" + client_secret);
    //xhr.setRequestHeader("Authorization", "Basic " + baseencodedclientdata);

    xhr.onload = function() {
        //console.log(xhr.responseText);
        let result = JSON.parse(xhr.responseText);
        accesstoken = result.access_token;
        getspotifyprofile();
    }

    let data = 'code=' + loginaccesscode + '&redirect_uri=' + window.location.protocol + "//" + window.location.host + window.location.pathname + "callback.html";

    xhr.send(data);
    //xhr.send();
}*/

function getaccesstoken(){
    let xhr = new XMLHttpRequest();
    //xhr.open("POST", "https://accounts.spotify.com/api/token");
    xhr.open("GET", "getbearer.php");

    xhr.setRequestHeader("Accept", "application/json");
    //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //var baseencodedclientdata = btoa(client_id + ":" + client_secret);
    //xhr.setRequestHeader("Authorization", "Basic " + baseencodedclientdata);

    xhr.onload = function() {
        //console.log(xhr.responseText);
        let result = JSON.parse(xhr.responseText);
        accesstoken = result.access_token;
    }

    //let data = 'grant_type=client_credentials';

    //xhr.send(data);
    xhr.send();
}

async function show_album(id){
    while(accesstoken == ""){
        getaccesstoken();
        await new Promise(r => setTimeout(r, 200));
    }
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "https://api.spotify.com/v1/albums/"+id+"/tracks?market=DE");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accesstoken);

    xhr.onload = () => {
        if(xhr.status == 200){
            var result = JSON.parse(xhr.responseText);

            var reslist = document.getElementById("resultList");
            reslist.innerHTML = ""; //cleanup
            
            try{
                document.getElementById("totalAmount").remove();
                document.getElementById("nextset").remove();
                document.getElementById("prevset").remove();
            }catch(exception){
                //console.log("nothing to remove");
            }

            result.items.forEach(track => {
                var rowItem = document.createElement("li");
                var inner = `🎵: <input class='form-check-input' type='checkbox' name='trackid[]' value='` + track.id + `'`;
                inner += ` onchange='if(this.checked){songselection["`+track.id+`"] = "`+track.name.replaceAll(`'`, `&apos;`)+`";}else{delete songselection["`+track.id+`"]}; updatelist();'>`;
                inner += ` <a href='` + track.external_urls.spotify + `'>` + track.name + `</a><br>by: `;
                track.artists.forEach(artist => {
                    inner += artist.name + ", ";
                });
                inner = inner.slice(0, -2);
                rowItem.innerHTML = inner;
                reslist.appendChild(rowItem);
            });
        }
    }

    xhr.send();

}

async function show_artists_top_tracks(id){
    while(accesstoken == ""){
        getaccesstoken();
        await new Promise(r => setTimeout(r, 200));
    }
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "https://api.spotify.com/v1/artists/"+id+"/top-tracks?market=DE");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accesstoken);

    xhr.onload = () => {
        if(xhr.status == 200){
            var result = JSON.parse(xhr.responseText);

            var reslist = document.getElementById("resultList");
            reslist.innerHTML = ""; //cleanup
            
            try{
                document.getElementById("totalAmount").remove();
                document.getElementById("nextset").remove();
                document.getElementById("prevset").remove();
            }catch(exception){
                //console.log("nothing to remove");
            }

            result.tracks.forEach(track => {
                var rowItem = document.createElement("li");
                var inner = `♫: <input type='checkbox' name='trackid[]' value='` + track.id + `'`;
                inner += ` onchange='if(this.checked){songselection["`+track.id+`"] = "`+track.name.replace(`'`, `&apos;`)+`";}else{delete songselection["`+track.id+`"]}; updatelist();'>`;
                inner += ` <a href='` + track.external_urls.spotify + `'>` + track.name + `</a><br>by: `;
                track.artists.forEach(artist => {
                    inner += artist.name + ", ";
                });
                inner = inner.slice(0, -2);
                rowItem.innerHTML = inner;
                reslist.appendChild(rowItem);
            });
        }
    }

    xhr.send();

}


async function searchspotify(query, types="album,artist,track", offset=0){
    while(accesstoken == ""){
        getaccesstoken();
        await new Promise(r => setTimeout(r, 200));
    }
    if(accesstoken != ""){
        let xhr = new XMLHttpRequest();
        xhr.open("GET", api_url + "/search?q=" + query + "&type=" + types + "&limit=50&offset="+offset+"&market=DE");

        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + accesstoken);

        xhr.onload = () => {
            if(xhr.status == 401){
                accesstoken = "";
                searchspotify(query, types, offset);
                return
            }

            if(xhr.status == 200){
                var result = JSON.parse(xhr.responseText);
                //console.log(result);
    
                var reslist = document.getElementById("resultList");
                reslist.innerHTML = ""; //cleanup
                try{
                    document.getElementById("totalAmount").remove();
                    document.getElementById("nextset").remove();
                    document.getElementById("prevset").remove();
                }catch(exception){
                    //console.log("nothing to remove");
                }
                var totalAmount = document.createElement("p");
                totalAmount.id = "totalAmount";
                reslist.parentNode.insertBefore(totalAmount, reslist);
    
                if(result.albums !== undefined){
                    totalAmount.innerHTML = `<a href='#' onclick='searchspotify("`+query+`", "album")'>Albums:</a> ` + result.albums.total;
                    result.albums.items.forEach(album => {
                        var rowItem = document.createElement("li");
                        rowItem.innerHTML = `💿: <a href='#' onclick='show_album("` + album.id + `");'>` + album.name + `</a><br>by: `;
                        album.artists.forEach(artist => {
                            rowItem.innerHTML += artist.name + ", ";
                        });
                        rowItem.innerHTML = rowItem.innerHTML.slice(0, -2);
                        reslist.appendChild(rowItem);
                    });
                }else{
                    totalAmount.innerHTML = `<a href='#' onclick='searchspotify("`+query.replaceAll(`'`, `&apos;`)+`", "album")'>Albums</a>`;
                }
    
                if(result.artists !== undefined){
                    totalAmount.innerHTML += ` | <a href='#' onclick='searchspotify("`+query.replaceAll(`'`, `&apos;`)+`", "artist")'>Artists:</a> ` + result.artists.total;
                    result.artists.items.forEach(artist => {
                        var rowItem = document.createElement("li");
                        rowItem.innerHTML = `🧑: <a href='#' onclick='show_artists_top_tracks("` + artist.id + `");'>` + artist.name + "</a>";
                        reslist.appendChild(rowItem);
                    });
                }else{
                    totalAmount.innerHTML += ` | <a href='#' onclick='searchspotify("`+query.replaceAll(`'`, `&apos;`)+`", "artist")'>Artists</a>`;
                }
    
                if(result.tracks !== undefined){
                    totalAmount.innerHTML += ` | <a href='#' onclick='searchspotify("`+query.replaceAll(`'`, `&apos;`)+`", "track")'>Tracks:</a> ` + result.tracks.total;
                    result.tracks.items.forEach(track => {
                        var rowItem = document.createElement("li");
                        var inner = `🎵: <input class='form-check-input' type='checkbox' name='trackid[]' value='` + track.id + `'`;
                        inner += ` onchange='if(this.checked){songselection["`+track.id+`"] = "`+track.name.replaceAll(`'`, `&apos;`)+`";}else{delete songselection["`+track.id+`"]}; updatelist();'>`;
                        inner += ` <a href='` + track.external_urls.spotify + `'>` + track.name + `</a><br>by: `;
                        track.artists.forEach(artist => {
                            inner += artist.name + ", ";
                        });
                        inner = inner.slice(0, -2);
                        rowItem.innerHTML = inner;
                        reslist.appendChild(rowItem);
                    });
                }else{
                    totalAmount.innerHTML += ` | <a href='#' onclick='searchspotify("`+query+`", "track")'>Tracks</a>`;
                }
    
                var prevset = document.createElement("a");
                prevset.id = "prevset";
                prevset.innerHTML = "<-- prev 50&nbsp;";
                prevset.onclick = function() {
                    searchspotify(query, types, offset-50);
                }
                prevset.href = "#";
                reslist.parentNode.insertBefore(prevset, reslist);
    
                var nextset = document.createElement("a");
                nextset.id = "nextset";
                nextset.innerHTML = "&nbsp;next 50 -->";
                nextset.onclick = function() {
                    searchspotify(query, types, offset+50);
                }
                nextset.href = "#";
                reslist.parentNode.insertBefore(nextset, reslist);
            }
        };

        xhr.send();
    }
}

function savedata(userdataform, selectionform){
    var userdata = new FormData(userdataform);
    //var selection = new FormData(selectionform);

    var finalformdata = {};

    for (const [key, value] of userdata){
        //console.log(key + " => " + value);
        finalformdata[key] = value;
    }
    /*for (const [key, value] of selection){
        //console.log(key + " => " + value);
        if(key.includes("[]")){
            if(!Array.isArray(finalformdata[key]))
                finalformdata[key] = [];
            finalformdata[key].push(value);
        }
    }*/
    finalformdata["trackid[]"] = [];
    finalformdata["trackname[]"] = [];
    Object.entries(songselection).forEach(entry => {
        let key = entry[0];
        let value = entry[1];
        //console.log(key + " => " + value);
        finalformdata["trackid[]"].push(key);
        finalformdata["trackname[]"].push(value);
    });

    ///*
    xhr = new XMLHttpRequest();

    xhr.open("POST", "handler.php");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function() {
        if(xhr.status == 200){
            //console.log(xhr.responseText);
            submissionform = document.getElementById("personaldata");
            var successmessage = document.createElement("div");
            successmessage.classList.add("alert");
            successmessage.classList.add("alert-success");
            successmessage.innerText = "Erfolgreich gespeichert!";
            submissionform.insertBefore(successmessage, submissionform.firstChild);
        }

    }

    //console.log(finalformdata);
    //console.log(JSON.stringify(finalformdata));

    xhr.send(JSON.stringify(finalformdata));
    //*/
}

function updatelist(){
    var selList = document.getElementById("selectionList");
    selList.innerHTML = "";

    Object.entries(songselection).forEach(track => {
        var li = document.createElement("li");
        li.textContent = track[1];
        selList.appendChild(li);
    });
}

function spotifylogin(){
    var scope = "user-read-email user-read-private playlist-read-private playlist-modify-public playlist-modify-private";
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: window.location.protocol + "//" + window.location.host + window.location.pathname + "callback.html",
        state: state
    });
    //console.log("https://accounts.spotify.com/authorize?" + params.toString());
    window.open("https://accounts.spotify.com/authorize?" + params.toString(), "_blank", "popup width=500 height=500");
};

function createplaylist(){
    //only functional in user.php
    
    let xhr = new XMLHttpRequest();

    xhr.open("POST", api_url + "/users/" + userid + "/playlists");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accesstoken);

    var playlistinput = document.getElementById("playlistname");
    var playlistbtn = document.getElementById("createplbutton");
    var playlistname = playlistinput.value;

    var data = {
        name: playlistname,
        description: "created by cebify",
        public: false
    }

    xhr.onload = function(){
        playlistinput.disabled = true;
        playlistbtn.classList.remove("btn-primary");
        playlistbtn.classList.add("btn-success");
        playlistbtn.innerText = "Erstellt!";
        playlistbtn.disabled = true;
        getuserplaylists();
    }

    xhr.send(JSON.stringify(data));
}

function savetoplaylist(button=undefined, tracks, playlist){
    //only functional in user.php
    
    let xhr = new XMLHttpRequest();

    xhr.open("POST", api_url + "/playlists/" + playlist + "/tracks");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accesstoken);

    var data = {};
    data.uris = [];
    tracks.forEach(item => {
        data.uris.push("spotify:track:" + item[2]);
    });

    xhr.onload = function(){
        console.log("saved tracks to playlist.");
        if(xhr.status == 201 && button !== undefined){
            button.disabled = true
            button.innerText = "OK!";
        }
    }

    //console.log(api_url + "/playlists/" + playlist + "/playlists");
    //console.log(data);

    xhr.send(JSON.stringify(data));
}

var lastplaylistoffset = 0;

function getuserplaylists(offset=0){
    lastplaylistoffset = offset;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", api_url + "/me/playlists?offset="+offset+"&limit=50");

    xhr.setRequestHeader("Accept", "application/json");
    //xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accesstoken);

    xhr.onload = function(){
        if(xhr.status == 200){
            var result = JSON.parse(xhr.responseText);
            var selectplaylist = document.getElementById("userplaylists");
            selectplaylist.innerHTML = ""; //cleanup
            result.items.forEach(item => {
                var option = document.createElement("option");
                option.value = item.id;
                option.innerText = item.name;
                selectplaylist.appendChild(option);
            });
        }
    }

    xhr.send();
}