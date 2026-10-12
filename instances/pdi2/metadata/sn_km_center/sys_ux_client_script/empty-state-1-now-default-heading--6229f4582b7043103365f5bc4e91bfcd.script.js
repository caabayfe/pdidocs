/**
    * @param {params} params
    * @param {api} params.api
    * @param {TransformApiHelpers} params.helpers
    */
    function evaluateProperty({ api, helpers }) {
        var ERROR_LABELS = {
            health_score_not_eligible: helpers.translateSync("Enable the Article Optimization Skill to start tracking Health Score"),
            ao_active_jobs_check_failed: helpers.translateSync("Enable at least one Article Optimization Job to start generating Health Scores"),
            health_score_job_running_or_scheduled: helpers.translateSync("Health score calculation loading."),
            health_score_job_excluded_from_evaluation: helpers.translateSync("All articles are excluded from article optimization jobs")
        };

        function getErrorLabel(errorCode) {
            return { label: ERROR_LABELS[errorCode] || helpers.translateSync("An unexpected error occurred") };
        }

        function getOutput(dataResource) {
            return dataResource && dataResource.output;
        }

        // Step 1: Check eligibility data is ready
        var eligibilityResult = getOutput(api.data.check_health_score_eligibility_1);
        if (!eligibilityResult) {
            return { label: "" };
        }

        // Step 2: Check eligibility passed
        if (!eligibilityResult.success) {
            return getErrorLabel(eligibilityResult.errorCode);
        }

        // Step 3: check the health score results running status.
        var healthscoreResultStatus = getOutput(api.data.check_health_score_job_running_status_1);

        if (healthscoreResultStatus && healthscoreResultStatus.showMessage) {
            return getErrorLabel(healthscoreResultStatus.error_code);
        }

        // Step 4: All checks passed — no error to show
        return { label: "" };
    }
