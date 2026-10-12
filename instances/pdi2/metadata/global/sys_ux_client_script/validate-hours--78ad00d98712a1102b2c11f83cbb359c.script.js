/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var hours = event.payload.fieldValue;
    var invalidMessage = [{
        "status": "critical",
        "content": "Invalid input",
        "icon": "circle-exclamation-outline"
    }];

    if (hours.length > 2 || hours.length === 0 || Number(hours) > 23 || Number(hours) < 0) {
        api.setState('invalidHour', invalidMessage);
    }
    else {
        api.setState('invalidHour', null);
    }

}
