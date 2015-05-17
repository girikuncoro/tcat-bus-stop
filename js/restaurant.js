/**
* @ param 
* @return [{name "Oishi bowl", rating : "4.5", link: "http://.."}, ...]
*/

function getMostPopRestaurant(loc){
  var restaurant;  
  d3.json("data/ithaca_foods.json", function(error, data) {
    restaurant = data;   
    var topFive = getItem(restaurant);

    topFive.forEach(function(d) {
        var ul = document.getElementById("restaurant-list");
        var li = document.createElement("li");
            li.className = "list-group-item";

        var name = document.createTextNode(d.name);
            
        var link = document.createElement("a");
            link.setAttribute("href", d.url);
            link.appendChild(name);
            link.className = "restaurant_name";
            li.appendChild(link);

        var rating = document.createElement("img");
            rating.setAttribute("src", d.rating_img_url);
            rating.setAttribute("alt", "restaurant rating");
            rating.className = "restaurant_rating";
            li.appendChild(rating);

        var categories = document.createElement("div");
            categories.className = "restaurant_categories";

        d.categories.forEach(function(cat) {
            var category = document.createElement("span");
                categoryNode = document.createTextNode(cat[0]);
                category.appendChild(categoryNode);
                category.className = "label label-default";
                categories.appendChild(category);
        });
        li.appendChild(categories);

        var review = document.createElement("p");
            reviewNode = document.createTextNode(d.snippet_text);
            review.appendChild(reviewNode);
            review.className = "restaurant_review";
            li.appendChild(review);

        ul.appendChild(li);        
    });
  });

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
}


  