var pointString = window.sessionStorage.getItem('point');
var point = JSON.parse(pointString);

var loc = [point.lat, point.lon];
var map = L.mapbox.map('map', 'zetter.i73ka9hn')
      .setView(loc, 15);

L.marker(loc).addTo(map)
    .bindPopup(point.name)
    .openPopup();

// schedules
// area
d3.select("#detail #area_name").html(point.area);
// schedule

d3.select("#img")
  .append("img")
  .attr("src", point.img)
  .attr("width", 200);

document.getElementById("currentTime").innerHTML = getCurrentTimeString();
getMostRecentSchedule(point.id);
getMostPopRestaurant(loc);

