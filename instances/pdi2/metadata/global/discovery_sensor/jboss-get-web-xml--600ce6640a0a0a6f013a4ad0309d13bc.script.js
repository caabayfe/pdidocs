runScript();

function runScript() {
    var filename = g_probe.getParameter("filename");
    if (!filename || filename.indexOf("WEB-INF/web.xml") == -1) {
        //Canceling the sensor processing... 
        cancel = true;
        return;
    }

    // docBase is between "deploy" and "WEB-INF"
    // name is xxx.war
    var start = filename.indexOf("deploy") + 6;
    var end = filename.indexOf("WEB-INF");
    if (end < start)
        end = filename.length;
    var docBase = filename.substring(start, end);
   
    var name = "";
    var dirs = filename.split("/");
    for (var i = 0; i < dirs.length; i++) {
        var dir = dirs[i];
        end = dir.indexOf(".war");
        if (end > 0) {
            name = dir.substring(0, end);
            break;
        }
    }

    if (name == "")
        name = docBase;

    current.addQuery("app_server", g_device.getCmdbCi());
    current.addQuery("document_base", docBase);
    current.query();
    if (!current.next()) {
        current.initialize();
        current.setNewGuid();
        current.app_server = g_device.getCmdbCi();
        current.name = name;
        current.document_base = docBase;
        current.short_description = descriptionVar;
		current.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
        current.insert();

        // make relationship
        g_disco_functions.createRelationship(g_device.getCmdbCi(), current.sys_id, "Contains::Contained by");
    }
}
