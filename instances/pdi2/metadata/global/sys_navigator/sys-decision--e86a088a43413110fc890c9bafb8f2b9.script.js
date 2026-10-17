(function() {
    var view = g_request.getParameter('sysparm_view');
    if (!gs.nil(view) && view == "manage_security")
        return "";

    // Convert to string
    var sysId = String(g_request.getParameter('sys_id'));
    var isValidDt = !gs.nil(sysId) && isValidDecision(sysId);
    if (isValidDt) {
        // Get the whitelisted the decision tables to open in Classic UI16 view
        var dtCsvInClassicView = gs.getProperty('com.glide.decision_table.launch_in_classic_view', '') || '';
        // Trim all the spaces in the property value
        if (dtCsvInClassicView.trim().split(/\s*,\s*/gm).indexOf(sysId) > -1) {
            return;
        }
    }

    // Ignore extraneous params
    try {
        g_uri.deleteParmameter('sysparm_target');
        g_uri.deleteParmameter('sysparm_view');
        g_uri.deleteParmameter('sysparm_list_css');
        g_uri.deleteParmameter('sysparm_group_sort');
        g_uri.deleteParmameter('sysparm_query');
        g_uri.deleteParmameter('sysparm_fixed_query');
        g_uri.deleteParmameter('sysparm_checked_items');
        g_uri.deleteParmameter('sys_id');
        g_uri.deleteParmameter('sys_is_list');
        g_uri.deleteParmameter('sys_target');
        g_uri.deleteParmameter('sysparm_referring_url');
        g_uri.deleteParmameter('sysparm_record_list');
        g_uri.deleteParmameter('sysparm_record_row');
        g_uri.deleteParmameter('sysparm_record_rows');
        g_uri.deleteParmameter('sysparm_record_target');
        g_uri.deleteParmameter('sysparm_reference');
        g_uri.deleteParmameter('sysparm_domain_restore');
        g_uri.deleteParmameter('sysparm_clear_stack');
    } catch (e) {

    }

    if (isValidDt) {
        // Existing
        return g_uri.toString('now/workflow-studio/builder?tableName=sys_decision&builderId=decision-table&sysId=' + sysId);
    } else {
        // New
        g_uri.set('action', 'insert');
        return g_uri.toString('now/workflow-studio/home/decision');
    }

})();

function isValidDecision(sysId) {
    var sysDecisionGr = new GlideRecord("sys_decision");
    return sysDecisionGr.get(sysId);
}
