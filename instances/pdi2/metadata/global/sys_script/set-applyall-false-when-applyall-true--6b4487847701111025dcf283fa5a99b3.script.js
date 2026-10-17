(function executeRule(current, previous /*null when async*/ ) {
    if (current.apply_all != previous.apply_all && current.apply_all == true) {
        var gr = new GlideRecord('sys_api_access_policy');
        gr.setValue('apply_all', false);
        gs.addErrorMessage(gs.getMessage("Error: Can't update Apply policy to all methods, versions, and resources in this API to true for Global REST API policy"));
        current.setAbortAction(true);
    }
})(current, previous);
