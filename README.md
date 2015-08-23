# Exploring Ithaca Bus Stop with Voronoi Map
##Overview
TCAT is a not­for­profit corporation that serves public transportation in Ithaca, Tompkins
County New York. They are well run and many of the bus drivers are so helpful. As
international students who use the buses regularly to travel to campus, downtown, and
around the county, we also love to explore the county’s beautiful nature, attractions, and most
importantly: foods. By using Voronoi map, we visualized which bus stops serve more eating
places and attractions that hopefully help students who do not have private cars explore great
places in Ithaca with buses.

##Data Description
Using the BeautifulSoup package, a library to pull data out from HTML files, we wrote Python
script to collect the bus stop locations and schedule data as well as campus building locations
from the web pages into json files. We also wrote another Python script to call Yelp API
through OAuth protocol to collect food and drink places in Ithaca into json file. In summary, we
obtained our data from three sources as below:
*TCAT Bus Official Website (www.tcatbus.com)
*Cornell Map (http://www.cornell.edu/about/maps/)
*Yelp (http://www.yelp.com/ithaca)

First, it is quite a challenge to collect data (screen scraping) from TCAT bus website due to
complexity of their website. In the end of the crawl, we collected 442 bus stops that include
the location coordinate, name of the stop, bus routes, area, and daily schedule. We ignore the
bus stops that are not given location coordinate since they are not yet operated in service by
TCAT.

Second, Cornell Map embeds numbers of campus buildings in their html source code. This
consists of libraries, fitness centers, and other campus attractions. In the end, the script
collected more than 480 buildings around campus area that include the name and location
coordinate.

Finally, Yelp provides a very good documentation on accessing their API in OAuth protocol.
By querying with keywords “food” and “drink” in Ithaca, the script crawled more than 330 food places and 180 drink places in Ithaca. The data includes name of the place, location
coordinate, number of reviews, rating, and review contents.

##Viz1: Where is the nearest bus stop from my position?
The map shows the bus stop points in Ithaca. We use Voronoi to divide the Ithaca map into
clusters. In mathematics, a Voronoi diagram is a partitioning of a plane into regions based on
distance to points in a specific subset of the plane. That set of points (called seeds, sites, or
generators) is defined beforehand, and for each seed there is a corresponding region
consisting of all points closer to that seed than to any other. These regions are called Voronoi
cells.

In addition, we add another layer on the map to show the number of surrounding facilities
near each Voronoi cell. The number of buildings are represented with different colors, for
example, green cells mean there is only one building around the specified bus stop and red
cells mean there are more than ten buildings around the bus stop. Users can click the
checkboxes on the top right to filter the buildings or the blue button to decide whether to show
the buildings.

We also integrate a geolocation API to locate the user’s current position on the map with a
blue marker. If the user’s position is beyond the range of Ithaca, the marker will automatically
be put around Phillips Hall. Then if a Voronoi cell is clicked, the map will show a black
boundary of that region and the corresponding bus stop name will appear on the left­bottom
position of the webpage. The bus stop name is linked to another web page which provides
details of that stop.

##Viz2: What can we know about this region except for the bus stop?
The second page linked to the bus stop name presents more details about its surroundings.
The first part is a more accurate map of that area. The second part shows the name of that
area and a button which can return to the previous web page. The third part displays the
upcoming buses through the stop with routes and corresponding times. The fourth part
provides a list of five nearest restaurants, including the restaurants’ name, rating, category
and review. The restaurant’s name is a link which redirects to the yelp page of that restaurant.

##Overcoming Challenges
The primary challenges in our project came from the fact that we wanted to incorporate a D3
voronoi diagram with street map of Ithaca and be able to interact with them in mobile phone or
tablet. There are several challenges: improper map tile display, calculating number of
buildings in the voronoi segmentation, and cross browser compatibility issue.

First, there is a very high chance (9 of 10 trials) that only half of the map is displayed in the
bus stop information page (detail.html) when we open the web page for the first time. The
potential reason for the problem is that leaflet.js does not render properly when the map
container size is changed. Luckily, it provides a function invalidatesize() to deal with such kind
of problems. After setting a timeout to call the function, the chance of the improper display is
drastically decreased (approximately only 1 of 20 trials).

Second, the D3 voronoi library doesn’t provide method to check if points are inside certain
voronoi segments. We then use ray­casting algorithm to find a point lies within polygon that is
drawn above the leaflet map layer.

Third, we were facing issue with cross browser compatibility (as many other web developers
face). Our work was working properly in chrome, but when we tried to open in safari, firefox
and browsers in iPhone, the voronoi drawings didn’t show up. We then resolved the issue by
replacing “includes” method in our Javascript files into “indexOf” which is more compatible
with the other browsers.

Finally, we intended to show the real time upcoming buses for a certain bus stop at a certain
time. We crawled data from Tcatbus website but it turned out that the data was not up­to­date
and the result was not as practical as we expected. Since the problem is beyond our scope,
we have no choice but using the old­dated data.

Overall, we think the visualization is useful, functional, and aesthetically pleasing. Although
we would like to include several more features if time permits such as direction from current
location to selected bus stops (using bus routes) and attractions information apart from
nearest restaurant in bus information page, we are very happy with the final result. Lastly, you
can also explore our work here http://tcatbus.github.io from desktop or mobile phones.
