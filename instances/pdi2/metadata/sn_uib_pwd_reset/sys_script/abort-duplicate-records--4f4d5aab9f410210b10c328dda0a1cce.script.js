(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('pwd_reset_uxf_route_mapping');
    gr.addQuery("sys_id", "!=", current.getUniqueValue());
    gr.addQuery('order', current.order);
    gr.addQuery('verification_type', current.verification_type);
    gr.addQuery('workspace', current.workspace);
    gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('Duplicate record: Another record with the same verification type, workspace, and order exists but with a different route.'));
        current.setAbortAction(true);
    }
})(current, previous);
