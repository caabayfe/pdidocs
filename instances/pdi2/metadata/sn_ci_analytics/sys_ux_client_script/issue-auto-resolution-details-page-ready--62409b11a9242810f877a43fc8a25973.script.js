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
        encodeFilter,
        generatePARFilterQuery,
        getBucketType,
        getCsvUrl
    } = imports["sn_ci_analytics.VADasboardUtils"]();
    var filter = {
        event_type: "Agent Zero Usage",
        event_name_filter: "Issue Auto Resolution"
    };
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

    const dropdownValue = getBucketType(isoFormattedStartDate, isoFormattedEndDate);

    // Update route params to consistently be in "yyyy-MM-dd" format
    helpers.navigate.setRouteParams({
        params: {
            startDate: isoFormattedStartDate,
            endDate: isoFormattedEndDate
        }
    });

    // Store dates in user preferred format in state variable. They'll be fed to date picker
    api.setState("datePickerInput", {
        startDate: datePickerStartDate,
        endDate: datePickerEndDate
    });

    filter.from_date = isoFormattedStartDate;
    filter.to_date = isoFormattedEndDate;
    filter.date_bucket = dropdownValue;
    filter.timestamp = Date.now();
    
    api.setState("dropdownValue", [dropdownValue]);
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
