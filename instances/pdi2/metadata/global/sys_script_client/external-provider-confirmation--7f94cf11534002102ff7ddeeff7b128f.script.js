function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue === 'false') {
        return;
    }
    var docObjMgr = new GlideAjax('global.DocumentObjectManager');
    docObjMgr.addParam("sysparm_name", "getColumnValue");
    docObjMgr.addParam("sysparm_sysId", g_form.getUniqueValue());
    docObjMgr.addParam("sysparm_tableName", "ds_document");
    docObjMgr.addParam("sysparm_columnName", "mp_document");
    docObjMgr.getXML(handleResponse);
}

function handleResponse(response) {
    var res = response.responseXML.documentElement.getAttribute('answer');
    if (res) {
        return;
    }
    g_scratchpad.clearExternal = "true";
    var gdw = new GlideModal("ds_connect_external_provider");
    gdw.on("closeconfirm", function() {
        if (g_scratchpad.clearExternal == "true") {
            g_form.clearValue('external');
        }
    });
    gdw.on("beforeclose", function() {
        if (g_scratchpad.clearExternal == "true") {
            g_form.clearValue('external');
        }
    });
    gdw.setTitle(getMessage("Connect with external cloud"));
    gdw.setPreference("sysparm_document_id", g_form.getUniqueValue());
    gdw.render();
}
