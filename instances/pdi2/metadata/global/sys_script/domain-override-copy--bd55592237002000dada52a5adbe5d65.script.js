copyModules();

function copyModules() {
    var gr = new GlideRecord("sys_app_module");
    gr.addQuery("application", current.sys_overrides);
    gr.query();
    while (gr.next()) {
        gr.application = current.getUniqueValue();
        gr.insert();
    }
}        
