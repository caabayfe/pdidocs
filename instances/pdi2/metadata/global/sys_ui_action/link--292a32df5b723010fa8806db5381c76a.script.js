function addReferences() {

    var checked = g_list.getChecked();
    var docIds = new Array();
    docIds = checked.split(",");
    for (var i = 0; i < docIds.length; i++) {
        var gr = new GlideRecord('ds_document_references');
        gr.initialize();
        gr.document = docIds[i];
        var gURL = new GlideURL();
        gURL.setFromCurrent();
        gr.table_name = gURL.getParam("sysparm_table_name");
        gr.target_record = gURL.getParam("sysparm_target_record");
        gr.insert();
    }
    globalThis.parent.GlideModal.prototype.get('ds_document_list').destroy();
}
