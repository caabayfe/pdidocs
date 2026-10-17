add_entry("requested", "false");

var xmlDoc = new XMLDocument(new GlideXMLStats().toStringWithInclude('clotho'));

try {
	if (xmlDoc) {
		// retrieve chronomark stats HTTP request URL
		var URL = xmlDoc.getNodeText("/xmlstats/clotho.connection.endpoint/URL");

		if (URL != null) {
			// retrieve connection status from xmlStats
			var statusFeedback = xmlDoc.getNodeText("/xmlstats/clotho.connection.status");
			add_entry("server", statusFeedback);
			add_entry("url", URL);

			// check to see if any endpoint is disconnected
			var disconnections = xmlDoc.getNodeText("xmlstats/clotho.connection.suspended_clients");
			disconnections = ((disconnections == "") ? "false" : "true");
			add_entry("endpoints", disconnections);

			// query error message
			var errorMessage = xmlDoc.getNodeText("xmlstats/clotho.connection.error");
			errorMessage = ((errorMessage != null) ? errorMessage : "GOOD");
			add_entry("feedback", errorMessage);

			// execute replication servlet HTTP request
			var req = new sn_ws.RESTMessageV2();
			req.setHttpMethod('GET');
			req.setEndpoint(URL + '/replication');
			response = req.execute();

			if (response.getStatusCode() == 200) { // HTTP request successful

				// parse the HTTP response
				var repData = JSON.parse(response.getBody());

				var last_lag = 0;
				if (repData && repData["master"] && repData["master"]["streaming"]) { // check replication via existence of keys
					if (repData["master"]["status"] == "streaming") { // check to see if data is streaming
						last_lag = repData["chronomark-stats"]["last-effective-lag"];

						// update last lag
						add_entry("last-lag", last_lag);
					} else { // if its not streaming, avoid inadvertent exception when reading chronomark-stats because it won't exist
						add_entry("feedback", "1+ Instances Online");
					}

					var alternative_endpoint = repData["master"]["endpoint"];
					URL = "http://" + alternative_endpoint + "/replication";
					req.setEndpoint(URL);
				} else {
					add_entry("feedback", "1+ Instances Online");
				}

				response = req.execute();

				if (response.getStatusCode() == 200) {
					repData = JSON.parse(response.getBody());

					if (repData && repData["master"] && repData["master"]["streaming"]) { // check replication via existence of keys
						if (repData["master"]["status"] == "streaming") {
							if (repData["chronomark-stats"]["last-effective-lag"] > last_lag) {
								last_lag = repData["chronomark-stats"]["last-effective-lag"];
							}
						}
					} else {
						add_entry("last-lag", last_lag);
					}
				}

			} else { // HTTP request failed

				throw new Error('Can\'t connect to replication stats.');

			}
		} else { // failed to parse URL
			throw new Error("Can\'t retrieve endpoint URL.");
		}
	} else { // HTTP request failed
		throw new Error('Can\'t connect to clotho stats.');
	}

} catch (e) {
    // second try
    try {
        sn_clotho.ClothoConfigService.testConnectivity();
        add_entry("server", "ONLINE");
        add_entry("feedback", "1+ Instances Online");
    } catch (e) {
        add_entry("server", "NO_ENDPOINT");
        add_entry("endpoints", "true");
        add_entry("feedback", e.message);
    }

}

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
