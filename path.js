function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var lines = [];

    for (var i of allTextLines) {
        var data = i.split(',');

        var tarr = [];
        for (var j = of data) {
            tarr.push(j);
        }
        lines.push(tarr);
    }
    return lines
}

let songArr = []
let arr = []

function findSong(id1, id2) {
    for (let song of songArr) {
        if ((song[0] == id1 && song[1] == id2) || (song[1] == id1 && song[0] == id2)) {
            return song[2];
        }
    }
}

function getSongName(SongId, id) {
    $.get(`https://vocadb.net/api/songs/${SongId}?lang=4`, function (data) {
        $(`#${id}`).append(`<a href=\'https://vocadb.net/S/${SongId}\' target="_blank">${data["name"]}</a>`);
    })
}

function getArtistNames(id1, id2, pId) {
    $.ajax({
        type: "GET",
        url: "https://vocadb.net/api/artists/" + id2,
        dataType: "json",
        async: true,
        success: function (data) {
            $(`#${pId}`).prepend(document.createTextNode(" in: "))
                .prepend($(`<strong>${data["defaultName"]}</strong>`));
            $.ajax({
                type: "GET",
                url: "https://vocadb.net/api/artists/" + id1,
                dataType: "json",
                async: true,
                success: function (data) {
                    $(`#${pId}`).prepend(document.createTextNode(" collaborated with "))
                        .prepend($(`<strong>${data["defaultName"]}</strong>`));
                }
            });
        }
    });
}

let G = new jsnx.Graph();
fetch('data/test.txt')
    .then(response => response.text())
    .then(data => {
        let data_arr = [];
        data.split("\n").forEach(i => {
            data_arr.push(i.split(" "))
        })
        G.addEdgesFrom(data_arr)
    }).then(function () {
    $.ajax({
        type: "GET",
        url: "data/songArr.csv",
        dataType: "text",
        async: false,
        success: function (data) {
            songArr = processData(data);
        }
    });

    $("#loading").empty().remove();
    $("#pathFinding").css("display", "");
    $("#submit").on("click", function () {
        $("#result").empty();
        $("#result").append(document.createTextNode("Computing Path..."))

        let artist1;
        if (isNaN($("#artist1").val())) {
            $.ajax({
                type: "GET",
                url: `https://vocadb.net/api/artists?query=${$("#artist1").val()}&allowBaseVoicebanks=true&maxResults=10`,
                dataType: "json",
                async: false,
                success: function (data) {
                    artist1 = data["items"][0]["id"].toString();
                }
            });
        } else {
            artist1 = $("#artist1").val();
        }

        let artist2;
        if (isNaN($("#artist2").val())) {

            $.ajax({
                type: "GET",
                url: `https://vocadb.net/api/artists?query=${$("#artist2").val()}&allowBaseVoicebanks=true&maxResults=10`,
                dataType: "json",
                async: false,
                success: function (data) {
                    artist2 = data["items"][0]["id"].toString();
                }
            });
        } else {
            artist2 = $("#artist2").val();
        }

        try {
            if (!G.hasNode(artist1) || !G.hasNode(artist2)) {
                $("#result").empty()
                    .append("<h2>Path not Found (If you think this is incorrect, please file an issue on <a href='https://github.com/Pyther99/Vocaloid-Artist-Path'>GitHub</a>)</h2>");
            } else {
                let path1 = jsnx.bidirectionalShortestPath(G, artist1, artist2)
                $("#result").empty();
                for (let i = 1; i < path1.length; i++) {
                    song = findSong(path1[i - 1], path1[i]);
                    $("#result").append(`<p id="${i}"></p>`);
                    getSongName(song, i);
                    getArtistNames(path1[i - 1], path1[i], i);

                }
            }

        } catch (e) {
            $("#result").append("<h2>No Path found (If you think this is incorrect, please file an issue on <a href='https://github.com/Pyther99/Vocaloid-Artist-Path'>GitHub</a>)</h2>");
        }

    })
});
