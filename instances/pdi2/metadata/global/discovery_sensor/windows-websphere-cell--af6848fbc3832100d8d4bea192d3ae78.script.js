new DiscoveryJSONSensor({

    processJSON: function() {

        if (related_data.name) {
            var gr = new GlideRecord("cmdb_ci_websphere_cell");
            gr.addQuery("name", related_data.name);
            gr.query();

            if (!gr.next()) {
                gr.initialize();
                gr.setNewGuid();
                gr.name = related_data.name;
				if (related_data.short_description)
                	gr.short_description = related_data.short_description;
				gr.cell_id = related_data.cell_id;
				gr.cell_discovery_protocol = related_data.cell_discovery_protocol;
				gr.cell_type = related_data.cell_type;
				gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
                gr.insert();

                // make relationship
                g_disco_functions.createRelationship(g_device.getCmdbCi(), gr.sys_id, "Contains::Contained by");
            } else 
                g_disco_functions.createRelationshipIfNotExists(g_device.getCmdbCi(), gr.sys_id, "Contains::Contained by");
        }

    },

    type: "DiscoveryJSONSensor"
});
