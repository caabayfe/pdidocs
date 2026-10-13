if (docBaseVar) {
    current.addQuery("app_server", g_device.getCmdbCi());
    current.addQuery("document_base", docBaseVar);
    current.query();

    if (!current.next()) {
        current.initialize();
        current.setNewGuid();
        current.app_server = g_device.getCmdbCi();
        current.context_path = pathVar;
        current.document_base = docBaseVar;
        current.name = docBaseVar;
		current.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
        current.insert();

        // make relationship
        g_disco_functions.createRelationship(g_device.getCmdbCi(), current.sys_id, "Contains::Contained by");
    } else {
        current.app_server = g_device.getCmdbCi();
        current.context_path = pathVar;
        current.document_base = docBaseVar;
    }
}
