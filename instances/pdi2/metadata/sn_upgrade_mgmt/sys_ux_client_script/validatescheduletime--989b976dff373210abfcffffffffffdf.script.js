/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedDateStr = event.payload.value;

    var selectedDate = new Date(selectedDateStr);
    if (isNaN(selectedDate.getTime())) {
        api.setState('disableSchedule', true);
        return;
    }
    // var currentTime = api.state.selectScheduleTime;
    // Must be in the future
    var now = new Date();
    if (selectedDate.getTime() > now.getTime()) {
        api.setState('disableSchedule', false);
        api.setState('selectScheduleTime', selectedDateStr);
    } else {
        api.setState('disableSchedule', true);
        api.setState('selectScheduleTime', selectedDateStr);
    }
}
