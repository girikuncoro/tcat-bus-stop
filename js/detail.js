var detail = function() {
    loadPage('detail.html', detailPage);
}


function detailPage() {
    var url = window.location.hash;
    var point = parseURLParams(url);

    var loc = [point.lat, point.lon];
    var map = L.mapbox.map('map', 'zetter.i73ka9hn')
          .setView(loc, 15);

    map.on('ready', function() {
        setTimeout(function() {map.invalidateSize(); }, 100);
    });
    
    L.marker(loc).addTo(map)
        .bindPopup(point.name)
        .openPopup();

    // schedules
    // area
    d3.select("#area_name").html(point.area);
    // schedule

    d3.select("#img")
      .append("img")
      .attr("src", point.img)
      .attr("width", 200);

    document.getElementById("currentTime").innerHTML = getCurrentTimeString();
    getMostRecentSchedule(point.id);
    getMostPopRestaurant(loc);

    function parseURLParams(url) {
        var queryStart = url.indexOf("?") + 1,
        queryEnd = url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

        if (query === url || query === "") {
            return;
        }

        for (i = 0; i < pairs.length; i++) {
            nv = pairs[i].split("=");
            n = decodeURIComponent(nv[0]);
            v = decodeURIComponent(nv[1]);

            parms[n] = v;
        }
        return parms;
    }
}

