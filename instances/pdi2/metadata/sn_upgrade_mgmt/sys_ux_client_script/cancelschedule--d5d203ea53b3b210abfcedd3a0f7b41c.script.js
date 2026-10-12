/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    function toScheduleFormat(input) {
        // "2026-04-29 21:54:19" → "2026/04/29 09:54:19 PM"
        var m = input && input.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
        if (!m) { return input; }   // fall back to raw if shape unexpected
        var h24 = parseInt(m[4], 10);
        var ampm = h24 >= 12 ? 'PM' : 'AM';
        var h12 = String(h24 % 12 || 12).padStart(2, '0');
        return m[1] + '/' + m[2] + '/' + m[3] + ' ' + h12 + ':' + m[5] + ':' + m[6] + ' ' + ampm;
    }
    var timeFormat = toScheduleFormat(api.state.scheduleTime);
    api.setState('systemScheduleTime', timeFormat);
    helpers.modal.open('cancel_schedule');
}
