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
        let selectedCategories = api.context.props.selectedCategories;
        const {
            calculateInitialDateRange
        } = imports["sn_ci_analytics.dateUtils"]();

        api.setState('selectedCategories', selectedCategories);

        const {
            startDate,
            endDate
        } = api.context.props;

        const {
            datePickerStartDate,
            datePickerEndDate,
            isoFormattedStartDate,
            isoFormattedEndDate
        } = calculateInitialDateRange(startDate, endDate);

        const {
            encodeFilter
        } = imports['sn_ci_analytics.VADasboardUtils']();
        
        const query = {
            from_date: isoFormattedStartDate,
            to_date: isoFormattedEndDate,
            platform: 'chat',
            event_type: 'Topic Category',
            event_name_filter: selectedCategories,
            timestamp: Date.now()
        };
        api.setState('parFilters', [{
            "order": 10,
            "type": "query",
            "apply_to": api.state.tables,
            "encoded_query": encodeFilter(query)
        }]);
        api.setState("dateRangePickerInput", {
            startDate: datePickerStartDate,
            endDate: datePickerEndDate
        });

        helpers.navigate.setRouteParams({
            params: {
                startDate: isoFormattedStartDate,
                endDate: isoFormattedEndDate,
                selectedCategories: selectedCategories
            }
        });
}
