copyMenuItems();
function copyMenuItems() {
    var gr = new GlideRecord("sys_polaris_configurable_menu_item");
    gr.addQuery("menu_id", current.sys_overrides);
    gr.query();
    while (gr.next()) {
        gr.menu_id = current.getUniqueValue();
        gr.update();
    }
}  
