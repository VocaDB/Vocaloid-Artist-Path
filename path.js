const dijkstra = (edges, source, target) => {
    const Q = new Set(),
        prev = {},
        dist = {},
        adj = {}

    const vertex_with_min_dist = (Q, dist) => {
        let min_distance = Infinity,
            u = null

        for (let v of Q) {
            if (dist[v] < min_distance) {
                min_distance = dist[v]
                u = v
            }
        }
        return u
    }

    for (let i = 0; i < edges.length; i++) {
        let v1 = edges[i][0],
            v2 = edges[i][1],
            len = edges[i][2]

        Q.add(v1)
        Q.add(v2)

        dist[v1] = Infinity
        dist[v2] = Infinity

        if (adj[v1] === undefined) adj[v1] = {}
        if (adj[v2] === undefined) adj[v2] = {}

        adj[v1][v2] = len
        adj[v2][v1] = len
    }

    dist[source] = 0

    while (Q.size) {
        let u = vertex_with_min_dist(Q, dist),
            neighbors = Object.keys(adj[u]).filter(v => Q.has(v)) //Neighbor still in Q

        Q.delete(u)

        if (u === target) break //Break when the target has been found

        for (let v of neighbors) {
            let alt = dist[u] + adj[u][v]
            if (alt < dist[v]) {
                dist[v] = alt
                prev[v] = u
            }
        }
    }

    {
        let u = target,
            S = [u],
            len = 0

        while (prev[u] !== undefined) {
            S.unshift(prev[u])
            len += adj[u][prev[u]]
            u = prev[u]
        }
        return [S, len]
    }
}

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var lines = [];

    for (var i = 0; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');

        var tarr = [];
        for (var j = 0; j < data.length; j++) {
            tarr.push(data[j]);
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

fetch('data/test.txt')
    .then(response => response.text())
    .then(data => {
        data.split("\n").forEach(i => {
            x = [i.split(" ")[0], i.split(" ")[1], 0]
            arr.push(x)
        })
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
            let [path1, length1] = dijkstra(arr, artist1, artist2);
            $("#result").empty();
            for (let i = 1; i < path1.length; i++) {
                song = findSong(path1[i - 1], path1[i]);
                $("#result").append(`<p id="${i}"></p>`);
                getSongName(song, i);
                getArtistNames(path1[i - 1], path1[i], i);

            }

        } catch (e) {
            $("#result").append("<h2>No Path found (If you think this is incorrect, please file an issue on <a href='https://github.com/Pyther99/Vocaloid-Artist-Path'>GitHub</a>)</h2>");
        }

    })
});
