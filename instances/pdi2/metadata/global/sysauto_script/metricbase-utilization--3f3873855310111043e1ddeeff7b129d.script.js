add_entry("util-requested", false);

// initalize HTTP request to xmlStats
var host = gs.getProperty('glide.change_current_app.whitelist');
var URL;
if (host == null) {
	URL = 'http://localhost:8080/xmlstats.do?include=clotho';
}
if (host.indexOf(',') != -1) {
	host = host.substring(0, host.indexOf(','));
}
if (host != null) {
	URL = 'http://' + host + '/xmlstats.do?include=clotho';
}
var req = new sn_ws.RESTMessageV2();
req.setEndpoint(URL);
req.setHttpMethod('GET');
	
var response = req.execute();
	
try {
	if (response.getStatusCode() == 200) {
		var xmlDoc = new XMLDocument2();
		xmlDoc.parseXML(response.getBody());
		var count = xmlDoc.getNodeText("/xmlstats/clotho.connection.pool/available");
		var i = 0;
		while (i < count) {
			var URI = xmlDoc.getFirstNode("/xmlstats/clotho.connection.endpoint");
			var str = URI.toString();
			var xmlDoc2 = new XMLDocument2();
			xmlDoc2.parseXML(str);
			var val = xmlDoc2.getNodeText("/clotho.connection.endpoint/URL");
			var res = execute_request(req, val);
			if (res == true) {
				break;
			} else {
				i = i + 1;
			}
		}
		
	}
		
} catch (e) {
	
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

function execute_request(req, URL) {
	req.setEndpoint(URL + '/utilization');
	response = req.execute();
	try {
		if (response.getStatusCode() == 200) {
			var resp = JSON.parse(response.getBody());
			add_entry("utilization", resp["utilization"]);
			add_entry("gap", resp["gap"]);
			return true;
		} else {
			return false;
		}
	} catch (e) {
		return false;
	}
}
