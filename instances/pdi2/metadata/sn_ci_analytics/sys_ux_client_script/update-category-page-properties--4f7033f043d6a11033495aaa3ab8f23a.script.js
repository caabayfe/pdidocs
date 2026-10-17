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
    const payload = event.payload;
    const item = payload.value;
        if (item) {
        helpers.navigate.to('topics', null, {
            startDate: api.context.props.startDate,
            endDate: api.context.props.endDate,
            selectedCategories: item
        });
    } else {
        const {
            getDateRangeFromISOString
        } = imports["sn_ci_analytics.dateUtils"]();
        const {
            isoStart,
            isoEnd
        } = payload;
        const {startDate, endDate} = getDateRangeFromISOString(isoStart, isoEnd);
        const selectedCategories = api.context.props.selectedCategories;
        const query = {
            from_date: startDate,
            to_date: endDate,
            platform: 'chat',
            event_type: 'Topic Category',
            event_name_filter: selectedCategories
        };
        const {
            encodeFilter
        } = imports['sn_ci_analytics.VADasboardUtils']();
        api.setState('parFilters', [{
            "order": 10,
            "type": "query",
            "apply_to": api.state.tables,
            "encoded_query": encodeFilter(query)
        }]);
        helpers.navigate.setRouteParams({
            params: {
                startDate: startDate,
                endDate: endDate,
                selectedCategories: selectedCategories
            }
        });
    }
}
