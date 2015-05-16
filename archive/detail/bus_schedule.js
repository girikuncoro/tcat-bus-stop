/**
 * @param stopid
 * @returns [{route: "37", time: "4:25 PM"}, ...]
 */
getMostRecentSchedule = function(stopid) {
    var datetime= getCurrentTime()
        day = datetime[0],
        time = datetime.splice(1),
        meridiem = datetime[3];

    d3.json("../data/bus_schedule_data.json", function(data) {
        var schedules;
        var qualifiedSchedules = [];
        data.forEach(function(d) {
            if (d.stopid == stopid) {
                schedules = d.schedule;
                return;
            }
        })
        if (!schedules) {
            noBus();
            return;
        }

        // weekdays
        if (day <= 5 && day >= 1 && schedules.weekdays) {
            qualifiedSchedules = qualifiedSchedules.concat(schedules.weekdays);
        }
        // sunday
        if (day == 0 && schedules.sunday) {
            qualifiedSchedules = qualifiedSchedules.concat(schedules.sunday);
        }
        // saturday
        if (day == 6 && schedules.saturday) {
            qualifiedSchedules = qualifiedSchedules.concat(schedules.saturday);
        }
        // mondaythursdaypm 
        if (day <= 4 && day >= 1 && meridiem == 'PM' && schedules.mondaythursdaypm) {
            qualifiedSchedules = qualifiedSchedules.concat(schedules.mondaythursdaypm);
        }
        // fridaypm
        if (day == 5 && meridiem == 'PM' && schedules.fridaypm) {
            qualifiedSchedules = qualifiedSchedules.concat(schedules.fridaypm);
        }

        var mostRecentSchedule =  getSchedules(time, qualifiedSchedules);
        
        handleDOM(mostRecentSchedule);
    });
}

function handleDOM(mostRecentSchedule) {
    var ul = document.getElementById("schedules");
    if (!mostRecentSchedule[0]) {
        noBus();
        return;
    }
    
    // append heads
    var li = document.createElement("li"),
        div1 = document.createElement("div"),
        div2 = document.createElement("div"),
        route = document.createTextNode("route"),
        time = document.createTextNode("Scheduled Arrival");


        div1.className = "route";
        div2.className = "time";
        div1.appendChild(route);
        div2.appendChild(time);
        li.appendChild(div1);
        li.appendChild(div2);
        ul.appendChild(li);

    // append schedules
    mostRecentSchedule.forEach(function(d) {
        var li = document.createElement("li");
        var route = document.createTextNode(d.route),
            time = document.createTextNode(d.time),
            div1 = document.createElement("div"),
            div2 = document.createElement("div");
        
        div1.className = "route";
        div2.className = "time";
        div1.appendChild(route);
        div2.appendChild(time);
        li.appendChild(div1);
        li.appendChild(div2);
        ul.appendChild(li);
    });
}
function noBus() {
    var p = document.getElementById("nobus");
    var noBus = document.createTextNode("No buses this time");
    p.appendChild(noBus);
}

/**
 * @returns datetime [day, hour, min, mediriem]
*/
function getCurrentTime() {
    var date = new Date(),
        day = date.getDay(),
        hour0 = date.getHours(),
        hour = hour0 < 12? hour0: hour0 - 12,
        min = date.getMinutes(),
        meridiem = hour0 < 12? "AM": "PM",
        datetime = [day, hour, min, meridiem];
    return datetime;
}

/**
 * @returns timeString h:min AM/PM
 */
function getCurrentTimeString() {
    var time = getCurrentTime();
    var timeStr = time[1] + ":" + (time[2] < 10? "0": "") + time[2] + " " + time[3];
    return timeStr;
}

/**
 * @param {Object[hour, min, mediriem]} time
 * @param {Object[]} schedules
 * @returns [{route: "37", time: "4:25 PM"}, ...]
 */
function getSchedules(time, schedules) {
    
    var mostRecentSchedule = [];
    var item = {};
    // item: {37: "4:25 PM", 40: "4:39 PM", 43: "4:44 PM", 52: "4:49 PM"}
    // mostRecentSchedule: [{route: "37", time: "4:25 PM"}, Object, Object, Object]
    schedules.forEach(function(d) {
        if (compareTime(time, splitTimeString(d.time)) <= 0) {
            if (!item[d.route_id]){
                item[d.route_id] = d.time;
            } else {
                if (compareTime(splitTimeString(d.time), splitTimeString(item[d.route_id])) < 0) {
                    item[d.route_id] = d.time;
                }
            }
        }
    });

    for (var route_id in item) {
        mostRecentSchedule.push({"route": route_id, "time": item[route_id]});
    }
    mostRecentSchedule.sort(function(a, b) { 
        return compareTime(splitTimeString(a.time), splitTimeString(b.time));
    });
    
    return mostRecentSchedule;
}

/**
 * @param {String} timeStr 4:25 PM
 * @returns {Object[hour, min, mediriem]} 
 */
function splitTimeString(timeStr) {
    var time = [];
    var tmp = timeStr.split(":");
    time[0] = tmp[0] < 12? tmp[0]: tmp[0]-12;
    tmp = tmp[1].split(" ");
    time[1] = tmp[0];
    time[2] = tmp[1];
    return time;
}

/**
 * @param {Object[hour, min, mediriem]} time
 * @param {Object[hour, min, mediriem]} time2
 * @returns -1: time earlier / less than time2
 *           0: equal
 *           1: time is later / more than time2
 */
function compareTime(time, time2) {
    // compare meridiem
    if (time[2] < time2[2]) {
        return -1;
    } else if (time[2] > time2[2]) {
        return 1;
    } else {
        // compare hour
        if (time[0] < time2[0]) {
            return -1;
        } else if (time[0] > time2[0]) {
            return 1;
        } else {
            // compare minute
            if (time[1] < time2[1]) {
                return -1;
            } else if (time[1] > time2[1]) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}


// function getMostPopRestaurant(loc){
//   var restaurant;
//   d3.json("../data/ithaca_foods.json", function(error, data) {
//      restaurant = data;   
//   });
  
//   getItem(restaurant);
  
// }

// function compare(position1, position2){
//   var dist1 = Math.sqrt((position1.latitude-loc[0])*(position1.latitude-loc[0])+(position1.longitude-loc[1])*(position1.longitude-loc[1]));
//   var dist2 = Math.sqrt((position2.latitude-loc[0])*(position2.latitude-loc[0])+(position2.longitude-loc[1])*(position2.longitude-loc[1]));
//   if(dist1 < dist2) return 1;
//   else if(dist1 > dist2) return -1;
//   return 0;
// }

// function getItem(restaurant) {
//     var bucket = new buckets.PriorityQueue(compare);
//     for (var i = 0; i < 339; i++) {
//         bucket.add(restaurant[i].location.coordinate);
//     };
//     var a = bucket.dequeue();
//     console.log(a); //returns 1, not 100
// } 

