// Update the short_description of the outage records so that they are visible in all forms relating to Outage.
// This is to be run once after an upgrade or activation of vendor_ticketing plugin.
//
var outage = new GlideRecord('cmdb_ci_outage');
outage.addQuery('short_description', '');
outage.query(); 	
while (outage.next()) {
	if(outage.cmdb_ci != "" && outage.cmdb_ci.name != "")
		outage.short_description = outage.cmdb_ci.name + " Outage";
	else 
		outage.short_description = "Outage";
	outage.update();
}
