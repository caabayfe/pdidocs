(function executeRule(current, previous /*null when async*/ ) {

    // Check if the Filter Criteria being deleted is referenced with any of the Policy,
    // If being used, should prohibit the deletion and Link for List of the filters referenced to all the Policies should be shown.
    var ga = new GlideAggregate("sys_authentication_policy_criteria_m2m");
    if (ga.isValid()) {
        ga.addAggregate("COUNT");
        ga.addQuery("sys_auth_filter_criteria", current.sys_id);
        ga.query();

        var res = 0;
        if (ga.next())
            res = ga.getAggregate("COUNT");

        if (res > 0) {
			var filerListLink = "/sys_authentication_policy_criteria_m2m_list.do?sysparm_query=sys_auth_filter_criteria="+current.sys_id;
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("Failed to delete Filter Criteria '{0}' as it is referenced in one or more Authentication Policy. Please remove the reference(s) from Policy before deleting. <a target='_blank' href='{1}'>Click here to review.</a>", [GlideStringUtil.escapeHTML(current.name), filerListLink]));
        }
    }

})(current, previous);
