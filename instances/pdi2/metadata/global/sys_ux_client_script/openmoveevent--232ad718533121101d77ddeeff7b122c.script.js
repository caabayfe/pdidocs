/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (api.state.hasWriteAccessOnCalendar) {
        const payload = event.payload;
        const requestParams = {
            sysId: payload.event.spanRecord.sys_id,
            isSeries: payload.event.spanRecord.repeat_type.value ? true : false,
            difference: payload.difference,
            newStartDate: payload.newStartMoment.format("YYYY-MM-DD HH:mm:ss"),
            newEndDate: payload.newEndMoment.format("YYYY-MM-DD HH:mm:ss"),
            curStartDate: payload.event.start,
            timeZone: api.state.timeZone
        };
        api.emit('SCHEDULE#OPEN_MOVE_EVENT', {
            requestParams
        });
    }
}
