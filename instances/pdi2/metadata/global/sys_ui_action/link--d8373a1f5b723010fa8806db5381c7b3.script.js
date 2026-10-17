function listDocuments() {
    var tableName = g_form.getTableName();
    var recSysId = g_form.getUniqueValue();
    var url = "/ds_document_list.do?sysparm_table_name=" + tableName + "&sysparm_target_record=" + recSysId + "&sysparm_source=addReferences";
    openList(url, tableName, recSysId);
}

function openList(url, tableName, recSysId) {
    var docModal = new GlideModal('ds_document_list');
    docModal.setTitle(getMessage("Add document references"));
    docModal.setWidth(1400);
    docModal.setAutoFullHeight(true);
    docModal.on('beforeclose', function() {
        refreshDocuments();
    });
    ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
        docModal.template = glideModalTemplate;
        docModal.renderIframe(url, function(event) {
            glideModalKeyDownHandler(event, docModal.getID());
            if (this.window.location.href.indexOf("sysparm_source=addReferences") === -1) {
                this.window.location.href = this.window.location.href + "&sysparm_table_name=" + tableName + "&sysparm_target_record=" + recSysId + "&sysparm_source=addReferences";
            }
        });
    });
}

function refreshDocuments() {
    var listId = g_form.getTableName() + ".REL:09e81282876120106e337f9719cb0b39";
    var list = typeof globalThis.GlideList2 !== "undefined" ? globalThis.GlideList2.getByName(listId) : null;
    if (list == null)
        list = typeof globalThis.GlideList !== "undefined" ? globalThis.GlideList.get(listId) : null;
    if (list != null)
        list.refresh();
}

function resizeIframe() {
    var x = g_glideBoxes.cm_add_affected_cis;
    x.autoDimension();
    x.autoPosition();
    x._createIframeShim();
}
