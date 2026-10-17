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
    try {
        const {
            payload: {
                startMoment,
                endMoment
            }
        } = event;
        const {
            startDate,
            endDate,
        } = api.state;
        const newStartDate = startMoment.format('YYYY-MM-DD');
        const newEndDate = endMoment.format('YYYY-MM-DD');

        api.setState('startDate', newStartDate);
        api.setState('endDate', newEndDate);
        let shouldRefresh = false;
        if (startDate !== newStartDate || endDate !== newEndDate)
            shouldRefresh = true;

        if (shouldRefresh) {
            helpers.timing.setTimeout(() => api.emit("SCHEDULE#DATE_RANGE_UPDATED"), 200);
        }

    } catch (err) {
        console.log("error with calendar date range update" + err);
    }

}
