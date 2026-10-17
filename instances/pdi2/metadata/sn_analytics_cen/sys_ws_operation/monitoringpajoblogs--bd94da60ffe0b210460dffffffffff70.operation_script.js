(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    /* Query the pa_job_logs table and for each job get the details for the last job execution. 
     * We are interested in following three categories-
     * state=collected_error
     * state=collected_warning
     * state=collecting^run_time>=1hr
     */
    try {
        const utils = new sn_analytics_cen.AnalyticsOverviewUtils();
        const paJobLogs = {
            collecting: utils.getRunningPAJobLogsOverAnHour(),
            collected_error: utils.getErrorPAJobLogs(),
            collected_warning: utils.getWarningPAJobLogs()
        };
        response.setContentType('application/json');
        response.setStatus(200);
        response.setBody({
            paJobLogs
        });
    } catch (e) {
        response.setError(new sn_ws_err.NotFoundError('Unable to fetch the PA job logs'));
        return;
    }

})(request, response);
