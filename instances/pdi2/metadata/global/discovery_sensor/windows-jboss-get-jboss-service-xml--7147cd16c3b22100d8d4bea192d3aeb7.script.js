new DiscoveryJSONSensor({

    processJSON: function() {

        if (related_data.name) {
            var gr = new GlideRecord("cmdb_ci_web_service");
            gr.addQuery("app_server", g_device.getCmdbCi());
            gr.addQuery("name", related_data.name);
            gr.query();

            if (!gr.next()) {
                gr.initialize();
                gr.setNewGuid();
                gr.app_server = g_device.getCmdbCi();
                gr.name = related_data.name;
                gr.short_description = related_data.desc;
				gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
                gr.insert();

                // make relationship
                g_disco_functions.createRelationship(gr.sys_id, g_device.getCmdbCi(), "Runs on::Runs");
            } else {
                gr.app_server = g_device.getCmdbCi();
                gr.short_description = related_data.desc;
                gr.update();
            }
        }

    },

    type: "DiscoveryJSONSensor"
});
