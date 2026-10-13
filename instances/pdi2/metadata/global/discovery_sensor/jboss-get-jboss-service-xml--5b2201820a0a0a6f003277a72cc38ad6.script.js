if (nameVar) {
    current.addQuery("app_server", g_device.getCmdbCi());
    current.addQuery("name", nameVar);
    current.query();

    if (!current.next()) {
        current.initialize();
        current.setNewGuid();
        current.app_server = g_device.getCmdbCi();
        current.name = nameVar;
		current.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
        current.insert();

        // make relationship
        g_disco_functions.createRelationship(current.sys_id, g_device.getCmdbCi(), "Runs on::Runs");
    } else
        current.app_server = g_device.getCmdbCi();
}
