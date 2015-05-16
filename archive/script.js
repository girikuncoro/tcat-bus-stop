var map = L.mapbox.map('map', 'zetter.i73ka9hn', {
        minZoom: 6,
        maxZoom: 18,
        maxBounds: [[42.460016,-76.528616],[42.430783,-76.428317]]
    })
    .setView([42.4447, -76.4826], 14);

var current = {};
navigator.geolocation.getCurrentPosition(function(position) {
    current.latitude = position.coords.latitude;
    current.longitude = position.coords.longitude;

    // current location with Ithaca
    if (withinIthaca(current)) {
        L.marker([current.latitude, current.longitude]).addTo(map);
            // .bindPopup('Hi there!')
            // .openPopup();
    } else {
        L.marker([42.4447, -76.4826]).addTo(map);
            // .bindPopup('Hi there!')
            // .openPopup();
    }
});


var selectedCell;
var url = 'data/busstop_data.json';
var getMostRecentSchedule = getMostRecentSchedule;
voronoiMap(map, url);


function withinIthaca(currentLocation) { 
    var leftTop = {lat: "42.460016", lon: "-76.528616"},
        rightTop = {lat: "42.455783", lon: "-76.436310"},
        leftBottom = {lat: "42.419794", lon: "-76.520078"},
        rightBottom = {lat: "42.430783", lon: "-76.428317"};

    var lat = currentLocation.latitude,
        lon = currentLocation.longitude;

    if (lat > Math.max(leftTop.lat, rightTop.lat) || lat < Math.min(leftBottom.lat, rightBottom.lat)) {
        return false;
    }
    if (lon < Math.min(leftTop.lon, leftBottom.lon) || lon < Math.max(rightTop.lon, rightBottom.lon)) {
        return false;
    }
    return true;
}