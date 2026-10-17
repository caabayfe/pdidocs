(function executeRule(current, previous) {
    var gr = new GlideRecord("sys_openapi");
    gr.addQuery("sys_scope", current.sys_scope);
    gr.addQuery("display_name", current.display_name);
    gr.query();
    if (gr.next() && gr.sys_id != current.sys_id) {
        gs.addErrorMessage(gs.getMessage("Open API with the name '{0}' and version '{1}' already exists.", [GlideStringUtil.escapeHTML(current.name), GlideStringUtil.escapeHTML(current.version)]));
        current.setAbortAction(true);
    }
})(current, previous);
