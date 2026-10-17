(function executeRule(current, previous /*null when async*/) {
	
	add_entry("requested", "false");

	// initalize HTTP request to xmlStats
	var URL = gs.getProperty('glide.servlet.uri') + 'xmlstats.do?include=clotho'; // url of first request
	var req = new sn_ws.RESTMessageV2();
	req.setEndpoint(URL);
	req.setHttpMethod('GET');

	// execute xmlStats HTTP request
	var response = req.execute();

	try {
		if (response.getStatusCode() == 200) { // HTTP request was successful

			// parse response body XML
			var xmlDoc = new XMLDocument2();
			try {
				xmlDoc.parseXML(response.getBody());
			} catch (e) {
				throw new Error('Can\'t parse clotho stats.');
			}

			// retrieve chronomark stats HTTP request URL
			URL = xmlDoc.getNodeText("/xmlstats/clotho.connection.endpoint/URL");
			req.setEndpoint(URL + '/replication');

			// retrieve connection status from xmlStats
			var feedback = xmlDoc.getNodeText("/xmlstats/clotho.connection.status");
			add_entry("server", feedback);

			// check to see if any endpoint is disconnected
			var disconnections = xmlDoc.getNodeText("xmlstats/clotho.connection.suspended_clients");
			disconnections = ((disconnections == "") ? "false" : "true");
			add_entry("endpoints", disconnections);

			// query error message
			var errorMessage = xmlDoc.getNodeText("xmlstats/clotho.connection.error");
			errorMessage = ((errorMessage != null) ? errorMessage : "GOOD");
			add_entry("feedback", errorMessage);


			// execute replication servlet HTTP request
			response = req.execute();

			if (response.getStatusCode() == 200) { // HTTP request successful

				// parse the HTTP response
				var repData = JSON.parse(response.getBody());
				
				var last_lag = 0;
				if (repData["master"]["status"] == "streaming") { // check to see if data is streaming
					last_lag = repData["chronomark-stats"]["last-effective-lag"];

					// update last lag
					add_entry("last-lag", last_lag);
				} else { // if its not streaming, avoid inadvertent exception when reading chronomark-stats because it won't exist
					add_entry("feedback", "1+ Instances Offline");
				}
				
				var alt = repData["master"]["endpoint"];
				URL = "http://" + alt + "/replication";
				req.setEndpoint(URL);
				
				response = req.execute();
				
				gs.log(response.getStatusCode());
				
				if (response.getStatusCode() == 200) {
					repData = JSON.parse(response.getBody());
					try {
						if (repData["master"]["status"] == "streaming") {
							if (repData["chronomark-stats"]["last-effective-lag"] > last_lag) {
								last_lag = repData["chronomark-stats"]["last-effective-lag"];
							}
						}
					} catch (e) {
						add_entry("last-lag", last_lag);
					}
				}

			} else { // HTTP request failed

				throw new Error('Can\'t connect to replication stats.');

			}

		} else { // HTTP request failed
			throw new Error('Can\'t connect to clotho stats.');
		}

	} catch (e) {
		// update table for failure
		add_entry("server", "NO_ENDPOINT");
		add_entry("endpoints", "true");
		add_entry("feedback", e.message);
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
