/**
fetch topic names
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
        getBucketType,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();
    const {
        calculateInitialDateRange,
        getDateRangeFromISOString
    } = imports["sn_ci_analytics.dateUtils"]();

    let { topicName, startDate, endDate } = api.context.props;
    if (!topicName && api.data.fetch_topics) {
        let topics = api.data.fetch_topics.output;
        topicName = topics && topics[0] || '';
    }

    if (event.name === "DATA_FETCH_SUCCEEDED") {
        const initialDateRange = calculateInitialDateRange(startDate, endDate);
        startDate = initialDateRange.isoFormattedStartDate;
        endDate = initialDateRange.isoFormattedEndDate;
        api.setState("datePickerInput", {
            startDate: initialDateRange.datePickerStartDate,
            endDate: initialDateRange.datePickerEndDate
        });
    } else if (event.name === 'SN_APPSEE_DATE_RANGE_PICKER#VALUE_CHANGED') {
        const {
            isoStart,
            isoEnd
        } = event.payload;
        const isoProcessedDateRange = getDateRangeFromISOString(isoStart, isoEnd);
        startDate = isoProcessedDateRange.startDate;
        endDate = isoProcessedDateRange.endDate;
    }


    function getFilter(startDate, endDate) {
        const bucketType = getBucketType(startDate, endDate);
        return {
            from_date: startDate,
            to_date: endDate,
            platform: "chat",
            event_name_filter: topicName,
            date_bucket: bucketType,
            event_type: "Topic",
            timestamp: Date.now()
        };
    }
    const encodedTopicFilter = encodeFilter(getFilter(startDate, endDate));
    const encodedTrendFilter = encodeFilter(getFilter(startDate, endDate));

    api.setState('parFilters', [{
            "order": 10,
            "type": "query",
            "apply_to": [
                "sn_ci_analytics_st_property_summary_by_event",
            ],
            "encoded_query": encodedTopicFilter
        },
        {
            "order": 11,
            "type": "query",
            "apply_to": [
                "sn_ci_analytics_st_event_occurrence"
            ],
            "encoded_query": encodedTrendFilter
        }
    ]);

    api.setState("selectedTopic", topicName);
    api.setState('bucketType', [getBucketType(startDate, endDate)]);
    api.setState('csvUrlTopicUsage', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodedTrendFilter));
    var params = {
        startDate: startDate,
        endDate: endDate,
        topicName: topicName
    };
    helpers.navigate.setRouteParams({
        params
    });
}
