/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    var eligibilityOutput = api.data.check_health_score_eligibility_1 &&
        api.data.check_health_score_eligibility_1.output;
    if (!eligibilityOutput || !eligibilityOutput.success) {
        return true;
    }
    var jobStatus = api.data.check_health_score_job_running_status_1 &&
        api.data.check_health_score_job_running_status_1.output;
    // All KBs excluded from AO jobs - nothing is loading, so hide the shimmer
    // (the empty-state message/icon shows instead).
    if (jobStatus && jobStatus.error_code === 'health_score_job_excluded_from_evaluation') {
        return true;
    }
    return !(jobStatus && jobStatus.showMessage);
}
