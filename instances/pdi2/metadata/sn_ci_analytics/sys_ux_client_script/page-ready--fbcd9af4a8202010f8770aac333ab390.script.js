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
        calculateInitialDateRange
    } = imports["sn_ci_analytics.dateUtils"]();
    const {
        startDate,
        endDate,
        encodedQuery
    } = api.context.props;

    api.setState("datePickerInput", {
        "startDate": startDate,
        "endDate": endDate
    });

    const {
        datePickerStartDate,
        datePickerEndDate,
        isoFormattedStartDate,
        isoFormattedEndDate
    } = calculateInitialDateRange(startDate, endDate);

    let params = {
        startDate: isoFormattedStartDate,
        endDate: isoFormattedEndDate,
        encodedQuery: encodedQuery
    };
    api.emit("DISPATCH_PAGE_HEADER_PARAMS", params);
}
