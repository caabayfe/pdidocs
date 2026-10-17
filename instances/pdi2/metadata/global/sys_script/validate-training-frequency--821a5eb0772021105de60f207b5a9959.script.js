(function executeRule(current, previous /*null when async*/ ) {
    var useCase;
    var solutionProps = JSON.parse(current.getValue("solution_properties"));
    if (solutionProps && solutionProps.schedulingInfo) useCase = solutionProps.schedulingInfo.useCase;
    var supportedUseCasesForRunJobsDaily = gs.getProperty("glide.platform_ml.supported_use_cases_for_run_jobs_daily");

    if (supportedUseCasesForRunJobsDaily.split(",").indexOf(useCase) == -1) {
        gs.addErrorMessage(sn_i18n.Message.getMessage('use_case_not_supported_for_daily_runs', 'The useCase defined in the solution_properties should be one of the supported use cases defined in glide.platform_ml.supported_use_cases_for_run_daily property for running jobs daily.'));
        gs.error(sn_i18n.Message.getMessage('use_case_not_supported_for_daily_runs', 'The useCase defined in the solution_properties should be one of the supported use cases defined in glide.platform_ml.supported_use_cases_for_run_daily property for running jobs daily.'));
        current.setAbortAction(true);
    }

})(current, previous);
