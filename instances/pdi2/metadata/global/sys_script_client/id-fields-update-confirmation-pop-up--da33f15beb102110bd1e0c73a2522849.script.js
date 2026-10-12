function onSubmit() {
    if (g_scratchpad.action) {
        return true;
    }
    if (g_form.getActionName() != "sysverb_update" && g_form.getActionName() != "sysverb_update_and_stay") {
        return true;
    }

    var header = getMessage("Are you sure you want to update ID Fields?");
    var docURL = '/api/now/v1/context_doc_url/update_id_fields';
    var syncTypeName = g_form.getValue('type_name');
    var tableName = g_form.getValue('table_name');
    var description1 = formatMessage(getMessage("It is important to note that this modification will result in the alteration of Federated IDs for all existing {0}[{1}] records, which may have implications on performance, compliance and licensing. "), syncTypeName, tableName);
    var description2 = formatMessage(getMessage("Furthermore, ensure that the newly selected configuration is a distinct combination within the {0} table."), tableName);
    var gdw = new GlideModal("identity_update_with_doc_button", false, "500");
    gdw.setTitle(header);
    gdw.setPreference('warning', 'true');
    gdw.setPreference('title', description1 + description2);
    gdw.setPreference('doc_url', docURL);
    gdw.setPreference('onPromptComplete', complete);
    gdw.render();
    function complete() {
        g_scratchpad.action = true;
        gsftSubmit(null, g_form.getFormElement(), g_form.getActionName());
    }
    return false;
}
