var map = function() {
    loadPage('map.html', mapPage);
}

function mapPage() {
    var map = L.mapbox.map('map', 'zetter.i73ka9hn', {
        minZoom: 10,
        maxZoom: 18,
        maxBounds: [[42.460016,-76.528616],[42.430783,-76.428317]]
    })
    .setView([42.4447, -76.4826], 15);

    var current = {};
    navigator.geolocation.getCurrentPosition(function(position) {
        current.latitude = position.coords.latitude;
        current.longitude = position.coords.longitude;

        // current location within Ithaca
        if (withinIthaca(current)) {
            L.marker([current.latitude, current.longitude]).addTo(map)
                .bindPopup('Your current location')
                .openPopup();
        } else {
            L.marker([42.4447, -76.4826]).addTo(map);
                // .bindPopup('Hi there!')
                // .openPopup();
        }
    });


    var selectedCell;
    var url = 'data/busstop_data.json';
    var places = ['data/ithaca_foods.json','data/ithaca_drink.json','data/campus_data.json'];
    var getMostRecentSchedule = getMostRecentSchedule;
    voronoiMap(map, url, places);


    function withinIthaca(currentLocation) { 
        var leftTop = {lat: "42.460016", lon: "-76.528616"},
            rightBottom = {lat: "42.430783", lon: "-76.428317"};

        var lat = currentLocation.latitude,
            lon = currentLocation.longitude;

        return (lat <= leftTop.lat && lat >= rightBottom.lat && lon <= rightBottom.lon && lon >= leftTop.lon);
    }
}
