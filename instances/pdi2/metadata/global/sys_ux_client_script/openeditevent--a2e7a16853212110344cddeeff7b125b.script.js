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
    const {
        roles
    } = api.context.session.user;
    if (api.state.hasWriteAccessOnCalendar) {
        const scheduleSpan = api.state.popoverTemplate.event;
        const startDate = scheduleSpan.start;
        const endDate = scheduleSpan.end;


        const dateRange = {
            startDate: startDate,
            endDate: endDate
        };
        const requestParameters = {
            encodedQuery: "schedule=" + api.context.props.sysId,
            dateRange: dateRange,
            scheduleSpanSysId: scheduleSpan.spanRecord.sys_id,
            timeZone: api.state.timeZone
        };
        api.emit('SCHEDULE#OPEN_ADD_EVENT', {
            requestParameters
        });
    }
}
