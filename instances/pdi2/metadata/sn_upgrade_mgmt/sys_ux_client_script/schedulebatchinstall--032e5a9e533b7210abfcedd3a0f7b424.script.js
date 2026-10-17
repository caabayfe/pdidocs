/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    function to24HourCanonical(input) {
        // "2026/05/30 09:54:19 PM" → "2026-05-30 21:54:19"
        var m = input && input.match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2}) (AM|PM)$/i);
        if (!m) { return input; }                       // fall back if shape unexpected
        var h = parseInt(m[4], 10) % 12;                // 12 → 0, 1–11 stay the same
        if (m[7].toUpperCase() === 'PM') { h += 12; }   // 0–11 + 12 → 12–23
        var hh = String(h).padStart(2, '0');
        return m[1] + '-' + m[2] + '-' + m[3] + ' ' + hh + ':' + m[5] + ':' + m[6];
    }
    var scheduleTime = to24HourCanonical(api.state.selectScheduleTime);
    api.setState("scheduleSessionId", "");
    api.setState("scheduleSessionId", api.state.sessionId);
    api.setState("scheduleDateTime", "");
    api.setState("scheduleDateTime", scheduleTime);
    helpers.modal.close('schedule_update');
    api.setState('hideLoader', false);
}
