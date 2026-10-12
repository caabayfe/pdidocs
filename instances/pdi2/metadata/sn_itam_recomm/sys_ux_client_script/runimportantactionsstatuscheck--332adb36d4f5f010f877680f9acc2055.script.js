/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!api.state.isRealTimeLoad) {
        let isJobRunning = api.data.get_important_actions_job_status.output;
        // When refreshIcon is clicked for the first time isJobRunning would be undefined.
        if (api.state.isFirstJobStatusCheck || isJobRunning || isJobRunning == undefined) {
            api.setState('isFirstJobStatusCheck', false);
            let timer = helpers.timing.setTimeout(() => {
                api.data.get_important_actions_job_status.refresh();
            }, 1000);

        } else {
            api.setState('isFirstJobStatusCheck', true);
            api.data.get_important_actions_for_dashboard.refresh();
        }
    }
}
