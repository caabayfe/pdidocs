/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    var eligibilityOutput = api.data.check_health_score_eligibility_1 &&
        api.data.check_health_score_eligibility_1.output;
    if (!eligibilityOutput || !eligibilityOutput.success) {
        return 'error';
    }
    var jobStatus = api.data.check_health_score_job_running_status_1 &&
        api.data.check_health_score_job_running_status_1.output;
    // All KBs excluded from AO jobs - show the same exclamation-mark icon used
    // on the KB health score drilldown and article side panel, not the loader.
    if (jobStatus && jobStatus.error_code === 'health_score_job_excluded_from_evaluation') {
        return 'error';
    }
    if (jobStatus && jobStatus.showMessage) {
        return 'no-activities';
    }
    return 'error';
}
