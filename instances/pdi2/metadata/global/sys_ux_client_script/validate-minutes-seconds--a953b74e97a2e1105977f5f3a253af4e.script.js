/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var invalidMessage = [{
        "status": "critical",
        "content": "Invalid input",
        "icon": "circle-exclamation-outline"
    }];

    if (event.elementId === 'minutes_input') {
        var minutes = event.payload.fieldValue;

        if (minutes.length > 2 || minutes.length === 0 || Number(minutes) > 59 || Number(minutes) < 0) {
            api.setState('invalidMinute', invalidMessage);
        }
        else {
            api.setState('invalidMinute', null);
        }
    }
    else {
        var seconds = event.payload.fieldValue;

        if (seconds.length > 2 || seconds.length === 0 || Number(seconds) > 59 || Number(minutes) < 0) {
            api.setState('invalidSecond', invalidMessage);
        }
        else {
            api.setState('invalidSecond', null);
        }
    }

}
