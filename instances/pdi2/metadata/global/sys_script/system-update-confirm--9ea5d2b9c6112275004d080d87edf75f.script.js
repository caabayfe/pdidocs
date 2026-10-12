var url = gs.getXMLText(current.payload, "//url");
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

current.processed = gs.nowDateTime();
current.update();
