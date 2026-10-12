(function executeRule(current, previous /*null when async*/ ) {

    // same as CrossScopeAccessRecorder
    var gr = new GlideRecord("sys_restricted_caller_access");
    gr.addQuery("sys_id", "!=", current.sys_id);
    gr.addQuery("source", current.source);
    gr.addQuery("source_scope", current.source_scope);
    gr.addQuery("source_type", current.source_type);
    gr.addQuery("source_table", current.source_table);
    gr.addQuery("target", current.target);
    gr.addQuery("target_scope", current.target_scope);
    gr.addQuery("target_type", current.target_type);
    gr.addQuery("target_table", current.target_table);
    gr.addQuery("operation", current.operation);
    if (SNC.RCAScriptUtils.isRequestedRcaEnabled())
        gr.addQuery("sys_scope", current.sys_scope);
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage("Duplicate Restricted Caller Access Privilege exists with the same fields. <a target='_blank' href='{0}'>Click here to view</a>", gr.getLink(true)));
    }


})(current, previous);
