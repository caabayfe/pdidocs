(function executeRule(current, previous) {
    var gr = new GlideRecord("sys_openapi_operation");
    gr.addQuery("name", current.name);
    gr.addQuery("openapi", current.openapi);
    gr.query();
    if (gr.next() && gr.sys_id != current.sys_id) {
        gs.addErrorMessage(gs.getMessage("Open API operation with the name '{0}' already exists.", [GlideStringUtil.escapeHTML(current.name)]));
        current.setAbortAction(true);
    }
})(current, previous);
