/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    var schedule = api.state.schedule;
    api.data.de_duplication_template_save_schedule.execute({
        'templateID': api.state.templateId,
        'schedule': schedule,
    });
}
