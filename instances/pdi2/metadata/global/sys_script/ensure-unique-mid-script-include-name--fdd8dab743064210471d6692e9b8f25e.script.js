(function executeRule(current, previous) {
    var gr = new GlideRecord("ecc_agent_script_include");
    gr.addQuery("name", current.name);
    gr.query();
    if (gr.next() && gr.sys_id != current.sys_id) {
        gs.addErrorMessage(gs.getMessage("MID Script Include with the name '{0}' already exists.", GlideStringUtil.escapeHTML(current.name)));
        current.setAbortAction(true);
    }
})(current, previous);
