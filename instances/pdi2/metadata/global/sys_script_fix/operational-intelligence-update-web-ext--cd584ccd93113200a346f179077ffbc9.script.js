//gel all metric extensions to update
var metric = new GlideRecord("ecc_agent_ext_context_metric");
metric.addNullQuery("web_ext");
metric.addQuery("enable_rest_listener", "true");
metric.query();


while (metric.next()) {

	//if it's configured to use MID server
	if ((metric.execute_on == "Specific MID Server") && (metric.mid_server)) {
		var webExtension = new GlideRecord("ecc_agent_ext_context_webserver");
		webExtension.addQuery("mid_server", metric.mid_server);
		webExtension.addQuery("execute_on", "Specific MID Server");
		webExtension.query();
		if (webExtension.next()) {
			metric.web_ext = webExtension.getUniqueValue();
			metric.update();

		}
	}
	else if ((metric.execute_on == "Specific MID Server Cluster") && (metric.mid_server_cluster)) {
		var webExtension = new GlideRecord("ecc_agent_ext_context_webserver");
		webExtension.addQuery("mid_server_cluster", metric.mid_server_cluster);
		webExtension.addQuery("execute_on", "Specific MID Server Cluster");
		webExtension.query();
		if (webExtension.next()) {
			metric.web_ext = webExtension.getUniqueValue();
			metric.update();
		}
	}
}
