(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("sys_polaris_configurable_menu_item");
    gr.addQuery("menu_id", current.getUniqueValue());
    gr.query();
    while (gr.next()) {
        gr.sys_domain = current.sys_domain;
        gr.update();
    }
})(current, previous);
