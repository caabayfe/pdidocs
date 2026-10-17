(function executeRule(current, previous /*null when async*/) {
    if (!SNC.DomainJobTypes.isSupportedInstallation())
        return;

    /*
     * HIERARCHY_CHANGE job type
     */
    //provide a message if inactive
    if (new SNC.DomainJobTypes('HIERARCHY_CHANGE').isActiveJobType())
        return;

    var nextActionInMinutes = new DomainJobTypeUtil().getNextAutoResumeInMinutes();
    if (nextActionInMinutes) {
        gs.addInfoMessage(gs.getMessage('domain_hierarchy_change_jobs_paused_manage_and_auto_resume', nextActionInMinutes));
    } else {
        gs.addInfoMessage(gs.getMessage('domain_hierarchy_change_jobs_paused_manage'));
    }

})(current, previous);
