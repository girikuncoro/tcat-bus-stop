showHide = function(selector) {
  d3.select(selector).select('.hide').on('click', function(){
    d3.select(selector)
      .classed('visible', false)
      .classed('hidden', true);
  });

  d3.select(selector).select('.show').on('click', function(){
    d3.select(selector)
      .classed('visible', true)
      .classed('hidden', false);
  });
}

voronoiMap = function(map, url, placesData, initialSelections) {
  var fillVoronoi;

  var showBuilding = false;

  var places = {},
      place = [];

  var pointTypes = d3.map(),
      points = [],
      lastSelectedPoint;

  var voronoi = d3.geom.voronoi()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

  // select a cell
  var selectPoint = function() {
    d3.selectAll('.selected').classed('selected', false);

    var cell = d3.select(this),
        point = cell.datum();

    lastSelectedPoint = point;
    cell.classed('selected', true);

    d3.select('#selected h1')
      .html('')
      .append('a')
        .text(point.name)
        .attr('href', "#/detail/?lat="+point.lat+"&lon="+point.lon+"&name="+point.name+"&area="+point.area+"&id="+point.id);

  }

  var drawPlacesSelection = function() {
    showHide('#selections');

    var circle = [{"x": 10, "y":30, "r": 5, "value":1, "color": getColor(1)},
              {"x": 50, "y":30, "r": 5, "value":5, "color": getColor(5)},
              {"x": 90, "y":30, "r": 5, "value":10, "color": getColor(9)},
              {"x": 130, "y":30, "r": 5, "value":'10+', "color": getColor(11)}];

    var svg = d3.select("#legend").append('svg')
                .attr("width",190)
                .attr("height",50);

    svg.selectAll("circle")
        .data(circle)
        .enter()
      .append("circle")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", function (d) { return d.r; })
        .style("fill", function (d) { return d.color; })
    
    svg.selectAll("text")
        .data(circle)
        .enter()
      .append("text")
        .attr("x", function (d) { return d.x + 10; })
        .attr("y", function (d) { return d.y + 5; })
        .text(function (d) { return d.value; });

    svg.append("text")
        .attr("x", 5)
        .attr("y", 10)
        .text("Number of attraction")
        .style("font-weight", "bold");

    var labels = d3.select('#square').selectAll('input')
        .data(placesData)
        .enter().append("label");

    labels.append("input")
      .attr('type', 'checkbox')
      .property('checked', true)
      .attr("value", function(d) { return d; })
      .on("change", updateVoronoi);

    labels.append("span")
      .text(function(d) {
        if (d.indexOf('foods') > -1) {
          return ' restaurant';
        } else if (d.indexOf('drink') > -1) {
          return ' pubs, coffee & tea';
        } else if (d.indexOf('campus') > -1) {
          return ' park, library & campus';
        } else {
          return ' places'
        }
      });
  }

  var updateVoronoi = function(p) {
    place = [];
    places[p].state = !places[p].state;

    for (var key in places) {
      if (places.hasOwnProperty(key)) {
        if (places[key].state) {
          place = place.concat(places[key].data);
        }
      }
    }
    draw();
  }

  //// draw types
  // var drawPointTypeSelection = function() {
  //   showHide('#selections');
  //   var labels = d3.select('#toggles').selectAll('input')
  //     .data(pointTypes.values())
  //     .enter().append("label");

  //   labels.append("input")
  //     .attr('type', 'checkbox')
  //     .property('checked', function(d) {
  //       return initialSelections === undefined || initialSelections.has(d.type)
  //     })
  //     .attr("value", function(d) { console.log(d);return d.type; })
  //     .on("change", drawWithLoading);

  //   // labels.append("span")
  //   //   .attr('class', 'key')
  //   //   .style('background-color', function(d) { return '#' + d.color; });

  //   // labels.append("span")
  //   //   .text(function(d) { return d.type; });
  // }

  // draw voronoi of selected types
  var selectedTypes = function() {
    // return d3.selectAll('#toggles input[type=checkbox]')[0].filter(function(elem) {
    //   return elem.checked;
    // }).map(function(elem) {
    //   return elem.value;
    // })
    return ["bus stop"];
  }

  // filter points according to type
  var pointsFilteredToSelectedTypes = function() {
    var currentSelectedTypes = d3.set(selectedTypes());
    return points.filter(function(item){
      return currentSelectedTypes.has(item.type);
    });
  }

  var drawWithLoading = function(e){
    d3.select('#loading').classed('visible', true);
    if (e && e.type == 'viewreset') {
      d3.select('#overlay').remove();
    }
    setTimeout(function(){
      draw();
      d3.select('#loading').classed('visible', false);
    }, 0);
  }

  var draw = function() {
    d3.select('#overlay').remove();

    var bounds = map.getBounds(),
        topLeft = map.latLngToLayerPoint(bounds.getNorthWest()),
        bottomRight = map.latLngToLayerPoint(bounds.getSouthEast()),
        existing = d3.set(),
        drawLimit = bounds.pad(0.4);

    filteredPoints = pointsFilteredToSelectedTypes().filter(function(d) {
      var latlng = new L.LatLng(d.lat, d.lon);

      if (!drawLimit.contains(latlng)) { return false };

      var point = map.latLngToLayerPoint(latlng);

      key = point.toString();
      if (existing.has(key)) { return false };
      existing.add(key);

      d.x = point.x;
      d.y = point.y;
      return true;
    });

    voronoi(filteredPoints).forEach(function(d) { d.point.cell = d; });

    var svg = d3.select(map.getPanes().overlayPane).append("svg")
      .attr('id', 'overlay')
      .attr("class", "leaflet-zoom-hide")
      .style("width", map.getSize().x + 'px')
      .style("height", map.getSize().y + 'px')
      .style("margin-left", topLeft.x + "px")
      .style("margin-top", topLeft.y + "px");

    var g = svg.append("g")
      .attr("transform", "translate(" + (-topLeft.x) + "," + (-topLeft.y) + ")");

    var svgPoints = g.attr("class", "points")
      .selectAll("g")
        .data(filteredPoints)
      .enter().append("g")
        .attr("class", "point");

    var buildPathFromPoint = function(point) {
      return "M" + point.cell.join("L") + "Z";
    }

    // from https://github.com/substack/point-in-polygon
    var pointInPolygon = function (point, vs) {
      // ray-casting algorithm based on
      // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
      var xi, xj, i, intersect,
          x = point[0],
          y = point[1],
          inside = false;
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        xi = vs[i][0],
        yi = vs[i][1],
        xj = vs[j][0],
        yj = vs[j][1],
        intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }

    fillVoronoi = function (point) {
      var countPlaces = 0;   

      place.forEach(function (p) {
        var placeLoc, 
            placePoints,
            isInside;
        
        placeLoc = [p.location.coordinate.latitude,
                  p.location.coordinate.longitude];

        placePoints_ = map.latLngToLayerPoint(placeLoc);
        placePoints = [placePoints_.x,placePoints_.y];
        
        isInside = pointInPolygon(placePoints,point.cell);

        if (isInside) {
          countPlaces ++;
        }
      });

      return getColor(countPlaces);
    }

    var drawPathBuilding = function (svgPoints_) {
      svgPoints_.append("path")
        .attr("class", "point-cell")
        .attr("d", buildPathFromPoint)
        .on('click', selectPoint)
        .classed("selected", function(d) { return lastSelectedPoint == d} )
        .style("stroke-width", 8)
        .style("fill", fillVoronoi)
        .style("opacity",0.2);
    }

    var drawPathWithoutBuilding = function (svgPoints_) {
      svgPoints_.append("path")
        .attr("class", "point-cell")
        .attr("d", buildPathFromPoint)
        .on('click', selectPoint)
        .classed("selected", function(d) { return lastSelectedPoint == d} )
    }

    showBuilding ? drawPathBuilding(svgPoints) : drawPathWithoutBuilding(svgPoints);

    svgPoints.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style('fill', function(d) { return '#' + d.color } )
      .attr("r", 2);

  }

    // show or hide building (the colored voronoi segment)
  $(".square").click(function(){
    showBuilding = !showBuilding;
    if (showBuilding) {
      d3.selectAll("path")
        .style("stroke-width", 8)
        .style("fill", fillVoronoi)
        .style("opacity",.2); 

      $(this).attr('value', 'Without color');
    } else {
      d3.selectAll("path")
        .style("stroke-width", 1)
        .style("fill","none")
        .style("opacity",1); 

      $(this).attr('value', 'Show color');
    }
  
  });

  var getColor = function (numberOfPlaces) {
    if (numberOfPlaces > 10) {
      return "#d7191c";
    } else if (numberOfPlaces > 5) {
      return "#fdae61";
    } else if (numberOfPlaces > 2) {
      return "#2b83ba";
    } else if (numberOfPlaces > 0) {
      return "#abdda4";
    } else {
      return "#ffffbf";
    }
  }

  var mapLayer = {
    onAdd: function(map) {
      map.on('viewreset moveend', drawWithLoading);
      drawWithLoading();
    }
  };

  showHide('#about');

  map.on('ready', function() {
    placesData.forEach(function(placeData) {
      d3.json(placeData, function(p) {
        places[placeData] = {state: true, data: p};
        place = place.concat(places[placeData].data);
      });
    });

    d3.json(url, function(busData) {
      points = busData;
      points.forEach(function(point) {
        point.type = "bus stop";
        point.color = "6FA740";
        pointTypes.set(point.type, {type: point.type, color: point.color});
      })

      //drawPointTypeSelection();
      drawPlacesSelection();
      map.addLayer(mapLayer);
    })
  });
}