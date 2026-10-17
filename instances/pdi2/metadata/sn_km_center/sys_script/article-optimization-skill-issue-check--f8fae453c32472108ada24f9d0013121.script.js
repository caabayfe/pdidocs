(function executeRule(current, previous /*null when async*/) {

    var utils = new sn_km_center.ArticleAssistUtils();
    if (!utils.isAoSkillEnabled()) {

        var m2mGR = new GlideRecordSecure('kb_assist_job_m2m_scan');
        m2mGR.addQuery('kb_assist_job', current.sys_id);
        m2mGR.query();

        var issueCount = 0;

        while (m2mGR.next()) {
            var scanDefSysId = m2mGR.getValue('scan_definition');
            if (!scanDefSysId)
                continue;

            var scanDefGR = new GlideRecordSecure('kb_assist_scan_definition');
            if (!scanDefGR.get(scanDefSysId))
                continue;

            if (scanDefGR.execution_type == 'skill' || scanDefGR.execution_type == 'scripted_ai') {
                issueCount++;
            }
        }

        if (issueCount > 0) {
			// Use `toString()` to prevent it from becoming a number with a decimal
            var message = gs.getMessage("There are {0} scan definition(s) that will not run because a required skill is not enabled", issueCount.toString());
			gs.addErrorMessage(message);
        }
    }

})(current, previous);
