if(nameVar) {
    // websphere applications (from nameVar) has the format xxx.ear/deployments/xxx
    // we just use the last part for the app name
    var appName = nameVar.substring(nameVar.lastIndexOf("/") + 1);

    var sgr = new GlideRecord("cmdb_ci_app_server_websphere");
    sgr.get(g_device.getCmdbCi());
    if (sgr.isValidRecord()) {
        current.addQuery("app_server", sgr.sys_id);
        current.addQuery("name", appName);
        current.query();

        if(!current.next()) {
            current.initialize();
            current.setNewGuid();
            current.app_server = sgr.sys_id;
            current.name = appName;
			current.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
            current.insert();

            // make relationship
            g_disco_functions.createRelationship(sgr.sys_id, current.sys_id, "Contains::Contained by");
        }
    }
}
