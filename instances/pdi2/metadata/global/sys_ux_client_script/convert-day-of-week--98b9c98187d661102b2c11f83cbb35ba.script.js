/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.look_up_scheduled_job.result.run_dayofweek.value !== null) {
        api.setState('dayOfWeek', String(api.data.look_up_scheduled_job.result.run_dayofweek.value));
    }
}
