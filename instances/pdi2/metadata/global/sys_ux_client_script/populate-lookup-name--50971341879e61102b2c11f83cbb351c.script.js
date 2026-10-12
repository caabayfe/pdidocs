/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var name = api.data.look_up_sim_config.result.name.value;
    var scheduledJob = api.data.look_up_sim_config.result.scheduled_job.value;
    if (name !== null) {
        api.setState('lookupName', 'IAR Scheduled Simulation for ' + name);
    }
    if (scheduledJob === null) {
        helpers.translate('None').then((translatedText) => {
            api.setState('scheduleString', translatedText);
        });
    }
}
