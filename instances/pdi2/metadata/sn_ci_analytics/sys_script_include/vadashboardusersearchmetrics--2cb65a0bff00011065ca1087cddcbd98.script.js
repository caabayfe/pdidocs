var VADashboardUserSearchMetrics = Class.create();
VADashboardUserSearchMetrics.prototype = {
    initialize: function() {},

    execute: function(v_table, v_query, metric) {
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var query = v_query.getEncodedQuery();
        var decodedFilter = vaUtils.decodeFilter(query);
        var fromDate = decodedFilter.filter.from_date;
        var toDate = decodedFilter.filter.to_date;
        var type = decodedFilter.filter.type;

        if (!vaUtils.isValidDate(fromDate) || !vaUtils.isValidDate(toDate) || !type) {
            CIAnalyticsLogger.getLogger('UserSearchMetrics').debug('Unable to load data due to missing/invalid parameter');
            return;
        }
        if (!(type === "AI" || type === "CS" || type === "TL")) {
            CIAnalyticsLogger.getLogger('UserSearchMetrics').debug('Unable to load data due to invalid type');
            return;
        }

        var typeToEventName = {};
        switch (metric) {
            case "queries_with_no_clicks":
                typeToEventName = {
                    "AI": "AI_SEARCH_ZERO_CLICKS",
                    "CS": "CONTEXTUAL_SEARCH_ZERO_CLICKS",
                    "TL": "BOT_OUTPUT_ZERO_CLICKS"
                };
                break;
            case "queries_with_no_results":
                typeToEventName = {
                    "AI": "AI_SEARCH_ZERO_RESULTS",
                    "CS": "CONTEXTUAL_SEARCH_ZERO_RESULTS"
                };
                break;
            case "trending_queries":
                typeToEventName = {
                    "AI": "AI_SEARCH_TRIGGERED",
                    "CS": "CONTEXTUAL_SEARCH_TRIGGERED",
                    "TL": "BOT_OUTPUT_CREATED"
                };
                break;
            case "trending_content":
                typeToEventName = {
                    "AI": "AI_SEARCH_RESULT_CLICKED",
                    "CS": "CONTEXTUAL_SEARCH_RESULT_CLICKED",
                    "TL": "BOT_OPUTPUT_LINK_CLICKED"
                };
                break;
            default:
                typeToEventName = {
                    "AI": "AI_SEARCH_ZERO_CLICKS",
                    "CS": "CONTEXTUAL_SEARCH_ZERO_CLICKS",
                    "TL": "BOT_OUTPUT_ZERO_CLICKS"
                };
        }

        var event_name_filter_value = typeToEventName[type];

        var body = {
            "from_date": fromDate,
            "to_date": toDate,
            "event_name_filter": event_name_filter_value,
            "event_type_filter": "Custom",
            "allow_statistical": true
        };

        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
        var event_response = response["Custom"] && response["Custom"][event_name_filter_value];

        if (response && response["Custom"] && event_response) {
            var terms = {};
            switch (metric) {
                case "queries_with_no_clicks":
                    terms = event_response["Search Term"];
                    break;
                case "queries_with_no_results":
                    terms = event_response["Search Term"];
                    break;
                case "trending_content":
                    switch (type) {
                        case "AI":
                            terms = event_response["Title"];
                            break;
                        case "CS":
                            terms = event_response["Title"];
                            break;
                        case "TL":
                            terms = event_response["URL"];
                            break;
                    }
                    break;
                case "trending_queries":
                    terms = event_response["Search Term"];
                    break;
                default:
                    terms = event_response["Search Term"];
            }

            var total = Object.keys(terms).reduce(function(acc, i) {
                return acc + terms[i];
            }, 0);
            var termByPercentage = Object.keys(terms).reduce(function(acc, term) {
                acc[term] = (terms[term] / total) * 100;
                return acc;
            }, {});

            function entries(obj) {
                return Object.keys(obj).map(function(key) {
                    return [key, obj[key]];
                });
            }
            var sortedTerms = entries(termByPercentage).sort(function(a, b) {
                return a[1] > b[1] ? -1 :
                    a[1] < b[1] ? 1 : 0;
            });


            sortedTerms.forEach(function(val, i) {
                var record = {
                    sys_id: gs.generateGUID()
                };
                record[metric] = val[0];
                record['total'] = val[1];
                v_table.addRow(record);
            });
        }
    },

    type: 'VADashboardUserSearchMetrics'
};
