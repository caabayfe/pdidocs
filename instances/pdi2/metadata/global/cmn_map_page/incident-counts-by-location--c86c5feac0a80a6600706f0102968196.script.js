//get the instances url so we can link back to it
var uri = gs.getProperty("glide.servlet.uri");
//create an aggregate query on the incident table
var count = new GlideAggregate('incident');
//set condition for active incidents
count.addQuery('active', 'true');
//set aggregate field to location to get count by location
count.addAggregate('COUNT', 'location');
//execute the query
count.query();

//loop through the results
while (count.next()) {

   //get the current record's location
   var loc = count.location;
   //get the count of incidents for this location
   var locCount = count.getAggregate('COUNT', 'location');
   //only display location is there are active incidents
   if (locCount > 0) {
      //create new new map item for this location
      var item = map.addItem(count);
      //set lat/long from the location record
      item.latitude = String(loc.latitude);
      item.longitude = String(loc.longitude);   
      
      //create a marker label with the count
      item.marker_label = locCount;
      //define label offset for proper position
      item.label_offset_left = -4;
      item.label_offset_top = -20;
      
      //option to define table and record for label hyperlink
      //setting table and sys_id will override the use of html parameter
      //item.table = 'cmn_location';
      //item.sys_id = loc;
      
      //build the link to the list of incidents for the location
      var link = 'href=' + uri + 'incident_list.do?sysparm_query=active%3Dtrue^location%3D' + loc;
      //build the html value to be displayed when you click the map icon
      item.html='<a ' + link + '>' + loc.getDisplayValue() + ' (' + locCount + ')</a>';
      
      //link to the icon image
      item.icon = "images/red_marker.png";
      //set the size of the icon based on the number of active incidents
      item.icon_width = 24;
      item.icon_height = 24;

   }
}
