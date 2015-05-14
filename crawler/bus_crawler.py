'''
	bus_crawler.py
	to crawl bus stops data 
    to crawl bus schedule for each stop from http://tcat.nextinsight.com/
    to crawl building data in Cornell campus from http://www.cornell.edu/about/maps/
	into json file

    WARNING: this integrated script is not fully tested, use iPython notebook for guaranteed result
'''

# IMPORT
from collections import OrderedDict
from bs4 import BeautifulSoup
import urllib2
import re
import json

# CONSTANT
base_url = "http://tcat.nextinsight.com/allstops.php"
add_url = "http://tcat.nextinsight.com"
base_route_url = 'http://tcat.nextinsight.com/stoproute.php?stopid='
campus_url = "http://www.cornell.edu/about/maps/"

# This function returns HTML content of given url
def get_content(url):
    req = urllib2.Request(url, headers={'User-Agent' : "Magic Browser"}) 
    content = urllib2.urlopen(req).read()
    return BeautifulSoup(content)

# This function returns stop data dictionary of given url
# The data to get: id, lat, long, name, area, fare zone, img url, stopping bus routes
def get_stop_data(stop_url):
    url = stop_url

    soup = get_content(url)
    key_words = ["Area", "Fare Zone"]
    stop_data = OrderedDict()

    for link in soup.find_all("a"):
        href = link.get('href')

        if 'summary' in href:
            stopid = href.find("stopid=") + len("stopid=")
            stop_data["id"] = href[stopid:]

            route_url = add_url + href
            route_soup = get_content(route_url)
            routes = route_soup.find(text="Show all times for this stop").parent.parent.next_sibling.next_sibling.get_text()
            stop_data["route"] = [int(route) for route in re.findall("[-+]?\d+[\.]?\d*", routes)]

        if '/map/' in href:
            lat = href.find('lat=') + len('lat=')
            lat_end = href.find('&',lat)
            lon = href.find('lon=') + len('lon=')
            lon_end = href.find('&',lon)
            stop_data["lat"] = href[lat:lat_end]
            stop_data["lon"] = href[lon:lon_end]

        if '/stoppics/' in href:
            stop_data["img"] = add_url + href

    for word in key_words:
        keys = word.lower().replace(" ","")
        stop_data[keys] = soup.find(text=word).parent.next_sibling.next_sibling.get_text()

    stop_data["name"] = soup.title.get_text()
    return stop_data

def get_stop_link():
    stop_link = list()

    for link in stop_soup.find_all("a"):
        if "/stops/" in link.get('href'):
            stops.append({'id':link.get('href')[len("/stops/"):], 'name':link.get_text(), 'link':add_url + link.get('href')})
            
    print stop_link
    return stop_link

# This function gets list of all bus stops from base url
# and write to JSON file bus_stop_data.json
def crawl_bus_stop():
    stop_soup = get_content(base_url)
    stops = get_stop_link()

    print "Total bus stops to crawl: {0}".format(len(stops))
    print "Begin crawling bus stops ..."

    # Getting data for each bus stop
    counter = 0
    stop_list = list()
    for stop in stops:
        stop_list.append(get_stop_data(stop['link']))
        counter += 1
        if counter % 10 == 0:
            print "Crawled {0} stops data".format(counter)

    # Write to JSON file
    with open("bus_stop_data.json", 'w') as outfile:
        json.dump(stop_list, outfile)

    print "Completed bus stop crawling process. Total stops data = {0}\n\n".format(counter)

# This function gets list of all bus stops from campus url
# and write to JSON file campus_building_data.json
def crawl_building():
    campus = list()
    soup = get_content(campus_url)
    print "Begin crawling campus building ..."

    for building in soup.find_all('a'):
        if building.get("class") is not None and 'locItem' in building.get("class"):
            campus.append({'id':int(building['id'][8:]),'name': building.get_text(),'category':building.parent['data-folder'],'lat':building.parent['data-lat'],'lon':building.parent['data-lng']})

    # Write to JSON file
    with open("campus_building_data.json", 'w') as outfile:
    json.dump(campus, outfile)

    print "Completed crawling process on campus building. Total building = {0}\n\n".format(len(campus))

# Get url that shows stop timetable from given bus stop url
# This is used in the get_bus_schedule function
def get_time_url(stop_url):
    route_soup = get_content(stop_url)
    for link in route_soup.find_all("a"):
        href = link.get('href')
        if 'summary' in href:
            stopid_ = href.find("stopid=") + len("stopid=")
            stopid = href[stopid_:]
            route_url = base_route_url + stopid
    
    if route_url is not None:
        return route_url
    else:
        return None

# Get bus schedule from given url with the stop's timetables
def get_bus_schedule(time_url):
    url = time_url
    soup = get_content(url)

    table = soup.find_all("td")
    data = list()
    schedule = {'saturday':[], 'sunday':[], 'weekdays':[]}

    for column in table:
        row = column.find_all(text=True)
        if 'Sunday' in row or 'Monday' in row or 'Tuesday' in row or 'Wednesday' in row or 'Thursday' in row or 'Friday' in row or 'Saturday' in row:
            continue
        data += row

    for i in range(0,len(data)):
        if 'Route' in data[i]:
            route_id = int(data[i][5:8])
            day = data[i].replace("-","")[9:].replace(" ","").lower()

            if day in schedule.keys():
                schedule[day].append({'route_id':route_id, 'time':data[i+1]})
            else:
                schedule[day] = list()
                schedule[day].append({'route_id':route_id, 'time':data[i+1]})
        else:
            continue
    return schedule

# This function gets list of all bus stops from campus url
# and write to JSON file campus_building_data.json
def crawl_bus_schedule():
    stops = get_stop_link()
    bus_schedule = list()

    for stop in stops:
        time_url = get_time_url(stop['link'])
        stopid = stop['link'][-4:]
        schedule = get_bus_schedule(time_url)
        bus_schedule.append({'stopid':stopid, 'schedule':schedule})
        
        if len(bus_schedule) % 10 == 0:
            print "Crawled bus schedule from {0} stops".format(len(bus_schedule))

    with open("bus_schedule_data.json", 'w') as outfile:
    json.dump(bus_schedule, outfile)

    print "Completed crawling process of bus schedule. Total bus stops:{0}".format(len(bus_schedule))

# MAIN
crawl_bus_stop()
crawl_bus_schedule()
crawl_building()

print "All processes have been completed. Have a nice day!"