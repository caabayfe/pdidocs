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
        name
    } = event;
    const dateFormat = api.context.session.user.dateFormat;

    switch (name) {
        case 'SN_APPSEE_DATE_RANGE_PICKER#VALUE_CHANGED':
            {
                const {
                    isoStart,
                    isoEnd
                } = event.payload;
                const {startDate, endDate} = getDateRangeFromISOString(isoStart, isoEnd);
                if (startDate && endDate) {
                    helpers.navigate.setRouteParams({
                        params: {
                            startDate: startDate,
                            endDate: endDate
                        }
                    });
                }
                break;
            };
    }
}
