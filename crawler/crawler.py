'''
	crawler.py
	to crawl bus stops data from http://tcat.nextinsight.com/
	into json file
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

# This function returns HTML content of given url
def get_content(url):
    req = urllib2.Request(url, headers={'User-Agent' : "Magic Browser"}) 
    content = urllib2.urlopen(req).read()
    return BeautifulSoup(content)

# This function returns stop data dictionary of given url
# The data to get: id, lat, long, name, area, fare zone, img url, stopping bus routes
def get_stop_data(url):
    stop_url = url

    soup = get_content(stop_url)
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

# MAIN
# Getting list of all bus stops from base url
stop_soup = get_content(base_url)
stops = list()

for link in stop_soup.find_all("a"):
    if "/stops/" in link.get('href'):
        stops.append({'id':link.get('href')[len("/stops/"):], 'name':link.get_text(), 'link':add_url + link.get('href')})
        
print stops
print "Total bus stops to crawl: {0}".format(len(stops))

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

print "Completed crawling process. Total stops data = {0}".format(counter)
