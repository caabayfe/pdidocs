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
        getBucketType,
        encodeFilter,
        generatePARFilterQuery,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();
    const {startDate, endDate} = api.context.props;
    var filter = {
        event_type: "Intent",
        from_date: startDate,
        to_date: endDate,
        timestamp: Date.now()
    };
    var dateBucketDropdown;

    switch (event.name) {
        case "MACROPONENT_READY": 
        case "MACROPONENT_PROPERTY_CHANGED": {
            dateBucketDropdown = getBucketType(startDate, endDate);
            break;
        }

        case "NOW_DROPDOWN#ITEM_CLICKED": {
            dateBucketDropdown = event.payload.item.id;
            break;
        }
    }

    filter.date_bucket = dateBucketDropdown;
    api.setState('dateBucketDropdown', [dateBucketDropdown]);
    api.setState('parFilters', generatePARFilterQuery(encodeFilter(filter), [
        "sn_ci_analytics_st_event_occurrence"
    ]));
    api.setState('csvUrlNluPrediction', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodeFilter(filter)));
}
