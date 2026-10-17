copyListScripts("sys_ui_list_script_client");
copyListScripts("sys_ui_list_script_server");

function copyListScripts(table) {
    var gr = new GlideRecord(table);
    if (!gr.isValid())
        return;

    gr.addQuery("list_control", current.sys_overrides);
    gr.query();
    while (gr.next()) {
        gr.list_control = current.getUniqueValue();
        gr.insert();
    }
}
