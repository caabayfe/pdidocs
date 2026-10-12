(function executeRule(current, previous /*null when async*/ ) {
    var conditions = current.getValue("catalog_conditions");
    if (!conditions || conditions.indexOf("javascript:") == -1)
        return;

    // A "javascript:" value embedded in a catalog condition is evaluated server-side
    var gr = new GlideRecord('sys_script_include');
    gr.newRecord();
    if (!gr.getElement('script').canWrite()) {
        gs.addErrorMessage(gs.getMessage("Using script is only allowed by admin. Please contact System Administrator"));
        current.setAbortAction(true);
    }
})(current, previous);
