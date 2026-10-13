(function() {
    var runFixScript = function() {
        var secureWebServerGr = new GlideMultipleUpdate("ecc_agent_ext_context_webserver");
        secureWebServerGr.addQuery("secure_connection", "1");
        secureWebServerGr.setValue("use_unified_keystore", "0");
        secureWebServerGr.execute();
        secureWebServerGr.close();

        var propGr = new GlideRecord("sys_properties");
        propGr.addQuery("name", "mid.webserver.secure_conn_fix_script_exec");
        propGr.setLimit(1);
        propGr.query();
        if (propGr.next()) {
            propGr.setValue("value", "true");
            propGr.setWorkflow(false);
            propGr.update();
        } else {
            propGr.initialize();
            propGr.setValue("name", "mid.webserver.secure_conn_fix_script_exec");
            propGr.setValue("type", "boolean");
            propGr.setValue("value", "true");
            propGr.setWorkflow(false);
            propGr.insert();
        }
    };

    var didFixScriptRunInThePast = function() {
        return gs.getProperty("mid.webserver.secure_conn_fix_script_exec", "false") == "true";
    };

    if (!didFixScriptRunInThePast())
        runFixScript();
})();
