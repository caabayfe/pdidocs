/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const recurrencePresetAndControllerUtils = imports['sn_app_ux_commons.RecurrencePresetAndControllerUtils']({api, event, helpers, imports});
    recurrencePresetAndControllerUtils.getCmnScheduleDetailsSuccessHandler();
}
