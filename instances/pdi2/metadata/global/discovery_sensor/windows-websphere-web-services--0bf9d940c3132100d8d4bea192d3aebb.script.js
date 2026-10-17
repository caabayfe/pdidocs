new DiscoveryJSONSensor({
	
	processJSON: function() {

		for (var i = 0; i < related_data.services.length; i++) {
			var service = related_data.services[i];
            if (service.name) {
                var gr = new GlideRecord("cmdb_ci_web_service");
                gr.addQuery("app_server", g_device.getCmdbCi());
                gr.addQuery("name", service.name);
                gr.query();

                if (!gr.next()) {
                    gr.initialize();
                    gr.setNewGuid();
                    gr.name = service.name;
					gr.app_server = g_device.getCmdbCi();
    				gr.service_id = service.id;
					gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
                    gr.insert();

                    g_disco_functions.createRelationship(gr.sys_id, g_device.getCmdbCi(), "Runs on::Runs");
                }
            }
        }

    },

    type: "DiscoveryJSONSensor"
});
