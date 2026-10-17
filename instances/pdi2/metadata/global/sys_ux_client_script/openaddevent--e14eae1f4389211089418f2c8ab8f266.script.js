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
        const {
            payload: {
                newStartMoment,
                newEndMoment
            }
        } = event;
        const startDate = newStartMoment.format('YYYY-MM-DD HH:mm:ss');
        const endDate = newEndMoment.format('YYYY-MM-DD HH:mm:ss');

        const dateRange = {
            startDate: startDate,
            endDate: endDate
        };
        const requestParameters = {
            encodedQuery: "schedule=" + api.context.props.sysId,
            dateRange: dateRange,
            scheduleSpanSysId: "-1",
            timeZone: api.state.timeZone
        };
        api.emit('SCHEDULE#OPEN_ADD_EVENT', {
            requestParameters
        });
    }
}
