/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        getDateRangeFromISOString
    } = imports["sn_ci_analytics.dateUtils"]();
    const {
        isoStart,
        isoEnd
    } = event.payload;
    const {
        startDate,
        endDate
    } = getDateRangeFromISOString(isoStart, isoEnd);

    const { encodedQuery } = api.context.props;

    if (startDate && endDate) {
        let params = {
            startDate: startDate,
            endDate: endDate
        };
        if(encodedQuery) params.encodedQuery = encodedQuery;
        api.emit("DISPATCH_PAGE_HEADER_PARAMS", params);
    }

}
