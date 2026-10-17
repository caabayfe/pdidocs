if (nameVar) {

    current.addQuery("name", nameVar);
    current.query();

    if (!current.next()) {
        current.initialize();
        current.setNewGuid();
        current.name = nameVar;

        // make relationship
        g_disco_functions.createRelationship(g_device.getCmdbCi(), current.sys_id, "Contains::Contained by");
    } else {
        current.name = nameVar;

        // see if we need to re-establish relationship
        var rgr = new GlideRecord("cmdb_rel_ci");
        rgr.addQuery("parent", g_device.getCmdbCi());
        rgr.addQuery("child", current.sys_id);
        rgr.query();
        if (!rgr.next())
            g_disco_functions.createRelationship(g_device.getCmdbCi(), current.sys_id, "Contains::Contained by");
    }
}
