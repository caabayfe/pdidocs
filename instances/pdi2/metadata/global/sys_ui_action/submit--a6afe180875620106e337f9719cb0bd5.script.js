function execute() {
    var ga = new GlideAjax('DocumentAnalyticsAPI');
    ga.addParam('sysparm_name', 'sendDataFromClient');
    ga.addParam('sysparm_document_creation_source', 'Platform');
    ga.getXMLAnswer();
    g_form.submit('sysverb_insert');
}

if (typeof window == 'undefined') {
    serverOnSubmit();
}

function serverOnSubmit() {
    var result = current.insert();
    if (result) {
        var uri = action.getGlideURI();
        tableInfo = extractTableNameAndSysId(uri);
        if (tableInfo) {
            var tableName = tableInfo.tableName;
            var tableSysId = tableInfo.tableSysId;
            if (tableName && tableSysId) {
                var gr = new GlideRecord("ds_document_references");
                gr.initialize();
                gr.document = result;
                gr.table_name = tableName;
                gr.target_record = tableSysId;
                gr.insert();
            }
        }
    }

    gs.include('ActionUtils');
    var au = new ActionUtils();
    au.postInsert(current);
}

function extractTableNameAndSysId(uri) {
    try {
        var parentTableName = uri.get("sysparm_collection") || parent.getTableName();
        var parentRecordSysId = uri.get("sysparm_collectionID") || parent.sys_id;
        return {
            tableName: parentTableName,
            tableSysId: parentRecordSysId
        };
    } catch (err) {
        return false;
    }
}
