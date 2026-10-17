copyUIActionViews();

function copyUIActionViews() {
    var gr = new GlideRecord("sys_ui_action_view");
    gr.addQuery("sys_ui_action", current.sys_overrides);
    gr.query();
    while (gr.next()) {
        gr.sys_ui_action = current.getUniqueValue();
        gr.insert();
    }
}
