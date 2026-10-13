(function executeRule(current, previous /*null when async*/) {
	
	add_entry("util-requested", false);

	var URL = gs.getProperty('glide.servlet.uri') + 'xmlstats.do?include=clotho'; // url of first request
	gs.log(URL);
	var req = new sn_ws.RESTMessageV2();
	req.setEndpoint(URL);
	req.setHttpMethod('GET');
	
	var response = req.execute();
	
	try {
		if (response.getStatusCode() == 200) {
			var xmlDoc = new XMLDocument2();
			xmlDoc.parseXML(response.getBody());
			URL = xmlDoc.getNodeText("/xmlstats/clotho.connection.endpoint/URL");
			req.setEndpoint(URL + '/utilization');
			response = req.execute();
			if (response.getStatusCode() == 200) {
				var resp = JSON.parse(response.getBody());
				add_entry("utilization", resp["utilization"]);
				add_entry("gap", resp["gap"]);
			}
		}
		
	} catch (e) {
		
	}

})(current, previous);

/*
this is a wrapper function to simplify ALL gliderecord entries. 

 the table mb_dashboard_stats has two columns
- entry: the label for an entry (used to signify what's being stored)
- value: the actual value being stored
*/
function add_entry(entry, value) {
	var gr = new GlideRecord('mb_dashboard_stats');
	var now = gs.now();
	
	gr.addQuery("entry", entry);
	gr.query();
	var exists = gr.hasNext();
	
	if (exists) {
		gr.next();
	} else {
		gr.initialize();
		gr.entry = entry;
	}
	gr.value = value;
	gr.sys_updated_on = now;
	gr.update();
}
