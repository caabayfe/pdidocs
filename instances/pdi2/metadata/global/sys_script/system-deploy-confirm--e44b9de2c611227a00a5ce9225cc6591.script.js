var url = gs.getXMLText(current.payload, "//url");
var cmdb = gs.getXMLText(current.payload, "//cmdb");
var war = gs.getXMLText(current.payload, "//war") ;
var desc = "URL: " + url + "\n"
 + "WAR: " + war + "\n";

// create cmdb_ci_service
var s = new GlideRecord("cmdb_ci_service");
s.initialize();
s.addQuery("name", "SNC instance - " + url);
s.query();

if (s.next()) {
 gs.print("Updating cmdb_ci "+ url);
 s.operational_status = "1";
 s.version = war;
 s.update();
} else {
 s.operational_status = "1";
 s.name = "SNC instance - " + url;
 s.comments = desc;
 s.version = war;
 s.insert();
}

// modify request
var c = new GlideRecord("change_request"); 
c.initialize();
c.addQuery("category", "Service-now Deployment");
c.addQuery("cmdb_ci", cmdb); 
c.query();

if (c.next()) {
  c.work_notes = "System deployed using WAR: " + war;
  c.state = "3";
  c.update();
} else {
  gs.print("SEVERE *** ERROR *** System Deploy Confirmed rule unable to locate and update Change for " + url);
}

current.processed = gs.nowDateTime();
current.update();
