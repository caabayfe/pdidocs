new DiscoveryJSONSensor({
	
	processJSON: function() {

		for (var i = 0; i < related_data.apps.length; i++) {
			var appName = related_data.apps[i];
            if (appName) {
                var gr = new GlideRecord("cmdb_ci_web_application");
                gr.addQuery("app_server", g_device.getCmdbCi());
                gr.addQuery("name", appName);
                gr.query();

                if (!gr.next()) {
                    gr.initialize();
                    gr.setNewGuid();
                    gr.name = appName;
					gr.app_server = g_device.getCmdbCi();
					gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
                    gr.insert();

                    g_disco_functions.createRelationship(g_device.getCmdbCi(), gr.sys_id, "Contains::Contained by");
                }
            }
        }

    },

    type: "DiscoveryJSONSensor"
});
