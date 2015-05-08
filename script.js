var map = L.mapbox.map('map', 'zetter.i73ka9hn')
      .setView([42.4447, -76.4826], 14);

L.marker([42.4447, -76.4826]).addTo(map)
    .bindPopup('Welcome to Ithaca!')
    .openPopup();

var selectedCell;
var url = 'data/busstop_data.json';
// initialSelection = d3.set(['Tesco', 'Sainsburys']);
voronoiMap(map, url);

