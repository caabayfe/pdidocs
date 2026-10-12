function include({
    imports
}) {

    const analyticsChartPayload = (payload) => {
        const route = payload.ctype.route;
        const {
            chart_title,
            table,
            metric_label,
            metric_aggregation_function: aggregate_function,
            metric_aggregate_field: aggregate_field,
            metric_time_aggregation: time_aggregation,
            trendby_aggregation_period: trendby_frequency,
            trendby_date_field: trendby_field,
            sort_by,
            sort_order,
            data_source,
            indicator,
            show_sparkline,
            sparkline_style,
            show_change,
            show_target,
            show_gap_percentage,
            show_change_percentage,
            show_score_date,
            groupby_field,
            show_others,
            show_header = true,
            show_border = true,
            bare_border = false,
            show_legend,
            show_legend_value,
            show_legend_percentage,
            show_metric_label,
            show_total_value,
            follow_filters = true,
            show_filter_icon = true,
            enable_drilldown = true,
            period_start = null,
            period_end = null,
            period = 'M',
            wrap_title = false,
            filter_query,
            custom_format = false,
            decimal_precision = 0,
            rounding = "HALF_UP",
            thousand_separator_enabled = true,
            abbreviation_enabled = false,
            number_in_tooltips_enabled = false,
            chart_variation
        } = payload.props_details;

        const chartPayload = {};
        chartPayload.chartTitle = chart_title;
        chartPayload.extensionType = route;
        chartPayload.chartVariation = "stacked";
        chartPayload.sortBy = sort_by;
        chartPayload.sortOrder = sort_order;
        chartPayload.showSparkline = show_sparkline === "true";
        chartPayload.sparklineStyle = sparkline_style;
        chartPayload.showChangePercentage = show_change_percentage === "true";
        chartPayload.showChange = show_change === "true";
        chartPayload.showTarget = show_target === "true";
        chartPayload.showGapPercentage = show_gap_percentage === "true";
        chartPayload.showScoreDate = show_score_date === "true";
        chartPayload.showHeader = show_header;
        chartPayload.showBorder = show_border;
        chartPayload.bareBorder = bare_border;
        chartPayload.showLegend = show_legend === "true";
        chartPayload.showLegendValue = show_legend_value === "true";
        chartPayload.showLegendPercentage = show_legend_percentage === "true";
        chartPayload.showMetricLabel = metric_label != "";
        chartPayload.showTotalValue = show_total_value === "true";
        chartPayload.followFilters = follow_filters;
        chartPayload.showFilterIcon = show_filter_icon;
        chartPayload.enableDrilldown = enable_drilldown;
        chartPayload.periodStart = period_start;
        chartPayload.periodEnd = period_end;
        chartPayload.period = period;
        chartPayload.wrapTitle = wrap_title;
        chartPayload.customFormat = custom_format;
        chartPayload.decimalPrecision = decimal_precision;
        chartPayload.rounding = rounding;
        chartPayload.thousandSeparatorEnabled = thousand_separator_enabled;
        chartPayload.abbreviationEnabled = abbreviation_enabled;
        chartPayload.numberInTooltipsEnabled = number_in_tooltips_enabled;
        chartPayload.chartVariation = chart_variation;


        switch (data_source) {
            case 'table':
                {
                    const dataSourcePayload_table = [{
                        "isDatabaseView": false,
                        "allowRealTime": true,
                        "label": chart_title,
                        "sourceType": "table",
                        "tableOrViewName": table,
                        "filterQuery": filter_query,
                        "reportSourceSysId": null,
                        "id": "dGFibGVpbmNpZGVudDE2NTIyNjIyNDM1Njg=",
                        "dataCategories": [
                            "trend",
                            "group",
                            "simple"
                        ]
                    }];
                    const numberFormat = (custom_format) ? {
                        "customFormat": true,
                        "rounding": rounding,
                        "decimalPrecision": decimal_precision,
                        "abbreviationEnabled": abbreviation_enabled,
                        "numberInTooltipsEnabled": number_in_tooltips_enabled,
                        "thousandSeparatorEnabled": thousand_separator_enabled
                    } : {
                        "customFormat": false
                    };
                    const metricPayload_table = [{
                        "dataSource": "dGFibGVpbmNpZGVudDE2NTIyNjIyNDM1Njg=",
                        "id": "ZEdGaWJHVnBibU5wWkdWdWRERTJOVEl5TmpJeU5ETTFOamc9MTY1MjI2MjI0NDgzOQ==",
                        "aggregateFunction": aggregate_function.toUpperCase(),
                        "numberFormat": numberFormat,
                        "axisId": "primary",
                        "label": metric_label,
                        "aggregateField": aggregate_field
                    }];
                    const groupByPayload = [{
                        "groupBy": [{
                            "dataSource": "dGFibGVpbmNpZGVudDE2NTIyNjIyNDM1Njg=",
                            "groupByField": groupby_field,
                            "isRange": false,
                            "isChoice": false,
                            "isPaBucket": false
                        }],
                        "maxNumberOfGroups": 10,
                        "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
                        "showOthers": show_others
                    }];
                    const trendByPayload = {
                        "trendByFrequency": trendby_frequency,
                        "trendByMinuteInterval": null,
                        "trendByFields": [{
                            "field": trendby_field,
                            "metric": "ZEdGaWJHVnBibU5wWkdWdWRERTJOVEl5TmpJeU5ETTFOamc9MTY1MjI2MjI0NDgzOQ=="
                        }]
                    };
                    chartPayload.dataSource = dataSourcePayload_table;
                    chartPayload.metric = metricPayload_table;
                    chartPayload.groupBy = groupByPayload;
                    chartPayload.trendBy = trendByPayload;

                    break;
                }
            case 'indicator':
                {
                    const dataSourcePayload_indicator = [{
                        "allowRealTime": true,
                        "allowTotalValue": true,
                        "indicatorType": "1",
                        "isScriptedIndicator": false,
                        "label": chart_title,
                        "sourceType": "indicator",
                        "uuid": {
                            "indicator": indicator,
                            "breakdowns": []
                        },
                        "id": "dGFibGVpbmNpZGVudDE2NDIwODUxMzgyMjI="
                    }];


                    const metricPayload_indicator = [{
                        "dataSource": "dGFibGVpbmNpZGVudDE2NDIwODUxMzgyMjI=",
                        "id": "ZEdGaWJHVnBibU5wWkdWdWRERTJOREl3T0RVeE16Z3lNakk9MTY0MjA4NTE0MDc3OQ==",
                        "aggregateIndicator": time_aggregation || "",
                        "frequency": 10,
                        "numberFormat": {
                            "customFormat": false
                        },
                        "axisId": "primary"
                    }];
                    const trendByPayload_indicator = {
                        "trendByFrequency": "date",
                        "trendByMinuteInterval": null,
                        "trendByFields": [{
                            "field": "anything",
                            "metric": "ZEdGaWJHVnBibU5wWkdWdWRERTJOREl3T0RVeE16Z3lNakk9MTY0MjA4NTE0MDc3OQ=="
                        }]
                    };
                    chartPayload.dataSource = dataSourcePayload_indicator;
                    chartPayload.metric = metricPayload_indicator;
                    chartPayload.trendBy = trendByPayload_indicator;
                    break;
                }
        }

        return chartPayload;
    };
    return {
        analyticsChartPayload
    };
}
