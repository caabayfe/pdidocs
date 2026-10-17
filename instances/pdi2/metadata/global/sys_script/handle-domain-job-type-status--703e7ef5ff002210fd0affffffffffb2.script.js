(function executeRule(current, previous /*null when async*/) {
    /*
    * HIERARCHY_CHANGE job type
    */
    var hierarchyChangeTypeJobActive = new SNC.DomainJobTypes('HIERARCHY_CHANGE').isActiveJobType();
    //put on scratchpad for availability in client scripts
    g_scratchpad.hierarchy_change_job_active = new SNC.DomainJobTypes('HIERARCHY_CHANGE').isActiveJobType();
    //show a message on form if inactive
    if (!hierarchyChangeTypeJobActive) {
        var nextActionInMinutes = new DomainJobTypeUtil().getNextAutoResumeInMinutes();
        if (nextActionInMinutes) {
            gs.addInfoMessage(gs.getMessage('domain_hierarchy_change_jobs_paused_and_auto_resume', nextActionInMinutes));
        } else {
            gs.addInfoMessage(gs.getMessage('domain_hierarchy_change_jobs_paused'));
        }
    }
})(current, previous);
