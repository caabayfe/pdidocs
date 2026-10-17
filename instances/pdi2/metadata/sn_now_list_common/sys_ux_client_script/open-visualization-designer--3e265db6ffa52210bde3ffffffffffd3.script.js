/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var tableName = api.context.props.table;
    var filterQuery = api.context.props.query;
    var groupBy = api.state.groupBy[0];
    var timestamp = new Date();
    var userName = api.context.session.user.fullName;
    var groupByLabel = api.context.props.columns.filter((element) => element.id === api.state.groupBy[0])[0].label;
    var dataSourceLabel = api.state.dataSourceLabel;
    var date = timestamp.toISOString().split('T')[0];
    var time = timestamp.toTimeString().split(' ')[0];
    var dateDisplay = date + ' ' + time;
    var vizType = api.state.visualizationLabel[api.state.visualizationType];
    var title = await helpers.translate('{0} on {1} by {2} created by {3}: {4}', vizType, dataSourceLabel, groupByLabel, userName, dateDisplay);
    var emptyStateContent = await helpers.translate("There are no scores available for the selected criteria. Contact your admin for more info.");
    var emptyStateHeading = await helpers.translate("No data available.");

    var payload = JSON.stringify({
        name: title,
        props: {
            "additionalGroupByConfig": [],
            "allowChangeDateRange": false,
            "applyDateRange": false,
            "bareBorder": false,
            "cacheExpirationTime": 0,
            "chartVariation": "stacked",
            "colorConfig": {
                "type": "default"
            },
            "configPropModifiers": {},
            "contextMenuActions": [],
            "dataLabelPosition": "middle",
            "dataPassthrough": null,
            "dataSources": [{
                "allowRealTime": true,
                "filterQuery": filterQuery,
                "dataCategories": ["group", "simple", "trend"],
                "id": "dGFibGVpbmNpZGVudDE3MTI2NzI1NDI2OTY=",
                "isDatabaseView": false,
                "sourceType": "table",
                "tableOrViewName": tableName
            }],
            "dateFormat": "default",
            "emptyStateAlignment": "vertical-centered",
            "emptyStateContent": emptyStateContent,
            "emptyStateHeading": emptyStateHeading,
            "emptyStateIllustration": "no-data",
            "enableClickAndStay": false,
            "enableCustomEmptyState": false,
            "enableDrilldown": true,
            "enableRealTimeUpdate": false,
            "filterConfigurations": [],
            "followFilters": true,
            "groupBy": [{
                "disableRanges": false,
                "groupBy": [{
                    "dataSource": "dGFibGVpbmNpZGVudDE3MTI2NzI1NDI2OTY=",
                    "groupByField": groupBy,
                    "isChoice": true,
                    "isPaBucket": false,
                    "isRange": false
                }],
                "maxNumberOfGroups": 10,
                "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
                "showOthers": false
            }],
            "headingLevel": 2,
            "hideDevSettings": false,
            "hideMatrixAggregate": false,
            "legendExpandToFit": false,
            "legendHorizontalAlignment": "center",
            "legendPosition": "bottom",
            "metrics": [{
                "aggregateFunction": "COUNT",
                "axisId": "primary",
                "dataSource": "dGFibGVpbmNpZGVudDE3MTI2NzI1NDI2OTY=",
                "numberFormat": {
                    "customFormat": false
                }
            }],
            "newReporting": false,
            "numberOfPeriods": 3,
            "period": "M",
            "refreshRequest": "",
            "scoreType": null,
            "selectedElements": [],
            "showAbsolutePeriod": false,
            "showAdditionalGroupBySelector": false,
            "showBorder": true,
            "showCacheTime": true,
            "showChange": false,
            "showChangeFrom": "previous",
            "showChangePercentage": false,
            "showClosestSeriesOnHover": true,
            "showComment": false,
            "showConfidenceBand": false,
            "showDataLabels": false,
            "showDataPassthrough": false,
            "showDataTable": false,
            "showDateRangeByDefault": false,
            "showFilterIcon": true,
            "showFirstGroupAggregate": false,
            "showForecast": false,
            "showForecastRange": false,
            "showGapPercentage": false,
            "showHeader": true,
            "showHeaderSeparator": false,
            "showLegend": true,
            "showLegendValue": false,
            "showMaximumRange": false,
            "showMetricLabel": false,
            "showOverlappingLabels": false,
            "showSecondGroupAggregate": false,
            "showSparkline": false,
            "showStackedValues": "none",
            "showSubAggregate": false,
            "showTarget": false,
            "showThreshold": false,
            "showTotalAggregate": false,
            "showTrend": false,
            "sortBy": "value",
            "sortByOrder": "desc",
            "telemetry": null,
            "useDataCache": false,
            "wrapTitle": false,
            "xAxisMaxLabelSize": 100,
            "xAxisTruncationType": "end",
            "xAxisWrapLabels": false,
            "yAxisHidden": false,
            "yAxisPosition": "bottom",
            "yAxisShowGrid": true,
            "yAxisStyle": "clean"
        },
        macroponentId: api.state.visualizations[api.state.visualizationType]
    });

    /*to open the visualization designer, we need to save the payload in browser storage as 
     using window object as: 
    window.localStorage.setItem('CREATE_VIZ_FROM_EXTERNAL_CONTEXT', payload);
    In UIB we do not have access to window object as all the client scripts run in sandbox environment. 
    Below is the workaround to overcome above limitation*/
    helpers.timing.setTimeout(function() {
        this.localStorage.setItem('CREATE_VIZ_FROM_EXTERNAL_CONTEXT', payload);
    });

    api.emit("NAV_ITEM_SELECTED", {
        "search": "",
        "route": "",
        "fields": {},
        "context": {
            "path": "/now/platform-analytics-workspace/visualization-designer/" + timestamp,
            "experienceName": "Platform Analytics Workspace"
        },
    });
}
