/**
* @ param 
* @return [{name "Oishi bowl", rating : "4.5", link: "http://.."}, ...]
*/

function getMostPopRestaurant(loc){
  var restaurant;  
  d3.json("../data/ithaca_foods.json", function(error, data) {
     restaurant = data;   
     var topFive = getItem(restaurant);
     console.log(topFive);
     // append heads
    var ul = document.getElementById("PopRestaurant");
    var li = document.createElement("li"),
        div1 = document.createElement("div"),
        Res = document.createTextNode("Five Nearest Restaurants");
        
        div1.className = "Res";
        div1.appendChild(Res);
        li.appendChild(div1);
        ul.appendChild(li);


    var ul = document.getElementById("RestaurantList");

    var li = document.createElement("li"),
        div1 = document.createElement("div"),
        div2 = document.createElement("div"),
        div3 = document.createElement("div"),
        Restaurant = document.createTextNode("Restaurant"),
        Rating = document.createTextNode("Rating"),
        LinkRes = document.createTextNode("Link");

        div1.className = "Restaurant";
        div2.className = "Rating";
        div3.className = "Link";
        div1.appendChild(Restaurant);
        div2.appendChild(Rating);
        div3.appendChild(LinkRes);
        li.appendChild(div1);
        li.appendChild(div2);
        li.appendChild(div3);
        ul.appendChild(li);

    // append schedules
    topFive.forEach(function(d) {
        var li = document.createElement("li");
        var Restaurant = document.createTextNode(d.name),
            Rating = document.createTextNode(d.rating),
            div1 = document.createElement("div"),
            div2 = document.createElement("div");
            div3 = document.createElement('a');
        
        div1.className = "Restaurant";
        div2.className = "Rating";
        div1.appendChild(Restaurant);
        div2.appendChild(Rating);
        //console.log(div3.href);
        div3.href =  d.mobile_url; 
        div3.innerHTML = "Link";
        li.appendChild(div1);
        li.appendChild(div2);
        li.appendChild(div3);
        ul.appendChild(li);
         var leftDiv = document.createElement("div"); //Create left div
        
        
        //div3 = document.createElement('a');
        // div3.href =  d.mobile_url;
        // div3.innerHTML = "Link"
        // li.appendChild(div3);
        
    });
  });
  

  
}

function compare(position1, position2){
  var dist1 = Math.sqrt((position1.location.coordinate.latitude-loc[0])*(position1.location.coordinate.latitude-loc[0])+(position1.location.coordinate.longitude-loc[1])*(position1.location.coordinate.longitude-loc[1]));
  var dist2 = Math.sqrt((position2.location.coordinate.latitude-loc[0])*(position2.location.coordinate.latitude-loc[0])+(position2.location.coordinate.longitude-loc[1])*(position2.location.coordinate.longitude-loc[1]));
  if(dist1 < dist2) return 1;
  else if(dist1 > dist2) return -1;
  return 0;
}

function getItem(restaurant) {
    var bucket = new buckets.PriorityQueue(compare);

    for (var i = 0; i < 339; i++) {
    	bucket.add(restaurant[i]);
    };
    var topFive = [];
    topFive.push(bucket.dequeue());
    topFive.push(bucket.dequeue());
    topFive.push(bucket.dequeue());
    topFive.push(bucket.dequeue());
    topFive.push(bucket.dequeue());
    return topFive;

}
  