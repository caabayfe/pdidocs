(function executeRule(current, previous /*null when async*/ ) {
    g_scratchpad.emptyACLPopupEnabled = gs.getProperty("glide.security.empty_acl.popup_window.enabled");
    var aclExcludeOpNameStr = gs.getProperty("com.glide.security.acl.record_operations_without_columns");
    if (GlideStringUtil.nil(aclExcludeOpNameStr))
        return;

    var aclExcludeOpIDs = [];
    var gr = new GlideRecord('sys_security_operation');
    gr.addQuery('name', 'IN', aclExcludeOpNameStr);
    gr.query();
    while (gr.next()) {
        aclExcludeOpIDs.push('' + gr.getValue('sys_id'));
    }
    g_scratchpad.aclExcludeOpIDs = aclExcludeOpIDs;
})(current, previous);
