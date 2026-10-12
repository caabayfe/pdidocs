/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
runContextAction();

function runContextAction() {
    var timestamp = new Date();
    var userName = g_user.getFullName();
    var url = new GlideURL('now/platform-analytics-workspace/visualization-designer/new' + timestamp.getTime());
    var tableName = g_list.getTableName();
    var filterQuery = g_list.getQuery({
        orderby: true,
        fixed: true
    });
    var groupBy = g_fieldName;
    var groupByLabel = g_fieldLabel;
	var date = timestamp.toISOString().split('T')[0]; // 2024-04-11
	var time = timestamp.toTimeString().split(' ')[0]; // 11:13:51
	var dateDisplay = date + ' ' + time; // 2024-04-11 11:13:51
    var payload = JSON.stringify({
        name: "Pie on " + g_list.getTitle() + " by " + groupByLabel + " created by " + userName + ": " + dateDisplay,
        props: visualizationProps(tableName, filterQuery, groupBy),
        macroponentId: "96abe7e38d8790718022c5630a92176c" //pie
    });

    localStorage.setItem('CREATE_VIZ_FROM_EXTERNAL_CONTEXT', payload);
	g_navigation.open(url.getURL());
}

function visualizationProps(tableName, filterQuery, groupByField) {
    return {
        "additionalGroupByConfig": [],
        "allowChangeDateRange": false,
        "applyDateRange": false,
        "bareBorder": false,
        "cacheExpirationTime": 0,
        "colorConfig": {
            "type": "default"
        },
        "componentId": "b8do2jsn",
        "configPropModifiers": {},
        "configVersion": "23.0.0-ci-SNAPSHOT",
        "contextMenuActions": [],
        "dataLabelsType": "both",
        "dataPassthrough": null,
        "dataSources": [{
            "allowRealTime": true,
            "dataCategories": ["group", "simple", "trend"],
            "id": "dGFibGVpbmNpZGVudDE3MTI3NTE2MTYzOTA=",
            "isDatabaseView": false,
            "filterQuery": filterQuery,
            "preferredVisualizations": ["d24d53f60350de7a652caf3188a46ed2"],
            "sourceType": "table",
            "tableOrViewName": tableName
        }],
        "dateFormat": "default",
        "emptyStateAlignment": "vertical-centered",
        "emptyStateContent": "There are no scores available for the selected criteria. Contact your admin for more info.",
        "emptyStateHeading": "No data available.",
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
                "dataSource": "dGFibGVpbmNpZGVudDE3MTI3NTE2MTYzOTA=",
                "groupByField": groupByField,
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
        "metrics": [{
            "aggregateFunction": "COUNT",
            "axisId": "primary",
            "dataSource": "dGFibGVpbmNpZGVudDE3MTI3NTE2MTYzOTA=",
            "id": "ZEdGaWJHVnBibU5wWkdWdWRERTNNVEkzTlRFMk1UWXpPVEE9MTcxMjc1MTYxODg5MQ==",
            "numberFormat": {
                "customFormat": false
            }
        }],
        "newReporting": false,
        "numberOfPeriods": 3,
        "period": "M",
        "refreshRequest": "",
        "registerOrientation": "horizontal",
        "registerPosition": "bottom",
        "scoreType": null,
        "selectedElements": [],
        "showAbsolutePeriod": false,
        "showAdditionalGroupBySelector": false,
        "showBorder": true,
        "showCacheTime": true,
        "showChange": false,
        "showChangeFrom": "previous",
        "showChangePercentage": false,
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
        "showMaximumRange": false,
        "showMetricLabel": false,
        "showRegister": true,
        "showRegisterOnSameLine": false,
        "showRegisterPercentage": false,
        "showRegisterValue": false,
        "showSecondGroupAggregate": false,
        "showSparkline": false,
        "showSubAggregate": false,
        "showTarget": false,
        "showThreshold": false,
        "showTotalAggregate": false,
        "showTrend": false,
        "sortBy": "value",
        "sortByOrder": "desc",
        "telemetry": null,
        "truncationType": "end",
        "useDataCache": false,
        "wrapTitle": false
    }
}
