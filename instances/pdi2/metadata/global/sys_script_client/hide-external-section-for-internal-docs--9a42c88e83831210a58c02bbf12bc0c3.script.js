function onLoad() {
    // get the associated document and it's "external" field value
    // if the "external" field value is false, hide external permission section. Otherwise, make it visible.
    var documentSysId = g_form.getValue("document");
    var docObjMgr = new GlideAjax('global.DocumentObjectManager');
    docObjMgr.addParam("sysparm_name", "getColumnValue");
    docObjMgr.addParam("sysparm_sysId", documentSysId);
    docObjMgr.addParam("sysparm_tableName", "ds_document");
    docObjMgr.addParam("sysparm_columnName", "external");
    docObjMgr.getXML(handleResponse);
}

function handleResponse(response) {
    var isExternalDoc = response.responseXML.documentElement.getAttribute('answer');
    g_form.setSectionDisplay('external_permissiondetails', Boolean(Number(isExternalDoc)));
}
