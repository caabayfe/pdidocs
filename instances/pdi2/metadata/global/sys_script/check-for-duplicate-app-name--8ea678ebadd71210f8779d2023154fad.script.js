(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var businessAppName = current.name;
    var sysId = current.getUniqueValue();

    var gr = new GlideRecord("cmdb_ci_business_app");
    gr.addQuery("name", businessAppName);
    gr.query();
    while (gr.next()) {
        if (gr.getUniqueValue() != sysId) {
            gs.addErrorMessage(gs.getMessage("A Business Application exists with the same name. Please verify"));
            current.setAbortAction(true);
        }
    }

})(current, previous);
