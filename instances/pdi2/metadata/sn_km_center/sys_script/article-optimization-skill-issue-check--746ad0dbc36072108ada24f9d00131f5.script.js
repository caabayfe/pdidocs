(function executeRule(current, previous /*null when async*/) {
    // Check if execution_type is 'skill' or 'scripted_ai'
    if (current.execution_type == 'skill' || current.execution_type == 'scripted_ai') {
		var utils = new sn_km_center.ArticleAssistUtils();
        if (!utils.isAoSkillEnabled()) {
            gs.addErrorMessage(gs.getMessage("Scan definition will not run because a required skill is not enabled."));
        }
    }
})(current, previous);
