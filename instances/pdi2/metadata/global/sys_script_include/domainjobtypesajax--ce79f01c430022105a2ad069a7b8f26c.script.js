var DomainJobTypesAjax = Class.create();
DomainJobTypesAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    PROGRESS_RESP_KEY_STATE: "state_label",
    PROGRESS_RESP_KEY_SCHEDULED_TIME: "state_scheduled_time",

    MSG_HIERARCHY_CHANGES_ACTIVE: gs.getMessage('The job is active and changes to domain hierarchy are being processed.'),
    MSG_HIERARCHY_CHANGES_INACTIVE: gs.getMessage('The job is not active and domain hierarchy changes are being queued for next job start.'),
    MSG_PROGRESS_NO_JOBS_SCHEDULED: gs.getMessage('There are no jobs scheduled.'),
    MSG_PROGRESS_JOB_IN_PROGRESS: gs.getMessage('The job is in progress. Review the syslog_domain table for status updates.'),
    MSG_PROGRESS_FAILED_TO_FETCH_DETAILS: gs.getMessage("Failed to fetch job details."),

    /**
     * Returns a json with 2 keys 'status' and 'progress'. The status will inform whether the job is active, and the progress field will indicate
     * if there is a job scheduled or in execution.
     */
    getJobTypeProgress: function() {
        var jobName = this.getParameter('sysparm_jobName');
        var response = {};
        try {
            var api = new SNC.DomainJobTypes(jobName);
            response['status'] = api.isActiveJobType() ? this.MSG_HIERARCHY_CHANGES_ACTIVE : this.MSG_HIERARCHY_CHANGES_INACTIVE;
            var progressResp = JSON.parse(api.getJobTypeExecutionState());
            var jobState = (this.PROGRESS_RESP_KEY_STATE in progressResp) ? progressResp[this.PROGRESS_RESP_KEY_STATE] : 'no_job_scheduled';
            switch (jobState.toLowerCase()) {
                case 'running':
                    response['progress'] = this.MSG_PROGRESS_JOB_IN_PROGRESS;
                    break;
                case 'ready':
                    response['progress'] = gs.getMessage('The job is scheduled to run at {0}', [progressResp[this.PROGRESS_RESP_KEY_SCHEDULED_TIME]]);
                    break;
                case 'no_job_scheduled':
                    response['progress'] = this.MSG_PROGRESS_NO_JOBS_SCHEDULED;
                    break;
                default:
                    response['progress'] = gs.getMessage("The scheduled job is in '{0}' state", [jobState]);
                    break;
            }
        } catch (err) {
            response['error'] = this.MSG_PROGRESS_FAILED_TO_FETCH_DETAILS;
        }
        return JSON.stringify(response);
    },

	/**
	 * Returns whether the given job type is currently active (boolean)
	 */
	isActiveJobType: function() {
		var apiName = ''+this.getParameter('sysparm_job_type_api');
		return new SNC.DomainJobTypes(apiName).isActiveJobType();
	},

	/**
	 * Activates or Deactivates the given job type
	 */
	updateJobState: function() {
		var apiName = ''+this.getParameter('sysparm_job_type_api');
		var jobStateValue = ''+this.getParameter('sysparm_state_value');
		var autoResumeValue = ''+this.getParameter('sysparm_auto_resume_value');
		var jt = new SNC.DomainJobTypes(apiName);
		switch(jobStateValue) {
			case 'active':
				jt.activateJobType();
				break;
			case 'paused':
				jt.deactivateJobType(autoResumeValue);
				break;
			//no default
		}
	},

    type: 'DomainJobTypesAjax'
});
