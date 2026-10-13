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
        encodeFilter,
        generatePARFilterQuery,
        getBucketType,
        getCsvUrl
    } = imports["sn_ci_analytics.VADasboardUtils"]();
    const {
        getDateRangeFromISOString
    } = imports["sn_ci_analytics.dateUtils"]();
    var filter = {
        event_type: "Agent Zero Usage",
        event_name_filter: "Issue Auto Resolution"
    };
    switch (event.name) {
        case "SN_APPSEE_DATE_RANGE_PICKER#VALUE_CHANGED":
            {
                const {
                    isoStart,
                    isoEnd
                } = event.payload;
                const {
                    startDate,
                    endDate
                } = getDateRangeFromISOString(isoStart, isoEnd);
                helpers.navigate.setRouteParams({
                    params: {
                        startDate: startDate,
                        endDate: endDate
                    }
                });
                const dropdownValue = getBucketType(startDate, endDate);
                filter.from_date = startDate;
                filter.to_date = endDate;
                filter.date_bucket = dropdownValue;
                api.setState("dropdownValue", [dropdownValue]);
                break;
            };
        case "NOW_DROPDOWN#ITEM_CLICKED":
            {
                const {
                    startDate,
                    endDate
                } = api.context.props;
                var bucketType = event.payload.item.id;
                filter.from_date = startDate;
                filter.to_date = endDate;
                filter.date_bucket = bucketType;
                api.setState("dropdownValue", [bucketType]);
                break;
            };
    }
    var parFiltersArray = generatePARFilterQuery(encodeFilter(filter), [
        "sn_ci_analytics_st_issue_auto_resolution",
        "sn_ci_analytics_st_property_summary_by_event",
        "sn_ci_analytics_st_event_property_value_trend"
    ]);
    var dateQuery = "sys_created_onBETWEENjavascript:gs.dateGenerate('" + filter.from_date + "','00:00:00')@javascript:gs.dateGenerate('" + filter.to_date + "','23:59:59')";
    parFiltersArray.push({
        order: 20,
        type: "query",
        apply_to: ["sys_cs_auto_resolution_context"],
        encoded_query: dateQuery
    });
    api.setState("parFilters", parFiltersArray);
    api.setState('csvUrlUsage', getCsvUrl('sn_ci_analytics_st_event_property_value_trend', encodeFilter(filter), {
        property_name: 'Usage'
    }));
    api.setState('csvUrlIntentAndTopic', getCsvUrl('sys_cs_auto_resolution_context', dateQuery, {
        property_name: 'Incidents'
    }));
}
