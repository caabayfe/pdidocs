/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var element = event.elementId;
    switch(element) {
        case 'alert_6':
        api.setState('showAddInstanceSuccessMsg', false);
        break;
        case 'alert_1':
        api.setState('showEstimatedDurationSummaryInfo', false);
        break;
        default:
        break;
    }
}
