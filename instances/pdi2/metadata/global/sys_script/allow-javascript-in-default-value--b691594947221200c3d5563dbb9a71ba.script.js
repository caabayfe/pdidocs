(function executeRule(current, previous /*null when async*/ ) {
    if (current.getValue("type") == "31") {
        var defaultValue = current.getValue("default_value");
        if ((defaultValue == "" || defaultValue == "javascript:gs.getUserID();") &&
            (!current.getElement("reference_qual").changes() || (current.getValue("reference_qual") || "").indexOf("javascript") == -1)) {
            return;
        }
    }

    var gr = new GlideRecord('sys_script_include');
    gr.newRecord();
    if (!gr.getElement('script').canWrite()) {
        gs.addErrorMessage(gs.getMessage("Using script is only allowed by admin. Please contact System Administrator"));
        current.setAbortAction(true);
    }
})(current, previous);
