var AnalyticsListMigrationUtils = Class.create();

const MIGRATION_LOG_PREFIX = "[AnalyticsListMigrationUtils]: ";
const LIST_PROPS_MAP = {
    'hideHeader': {
        'name': 'showHeader',
        'isToggle': true
    },
    'table': {
        'name': 'table',
        'isToggle': false
    },
    'followFilters': {
        'name': 'followFilters',
        'isToggle': false
    },
    'query': {
        'name': 'filterQuery',
        'isToggle': false
    },
    'fixedQuery': {
        'name': 'filterQuery',
        'isToggle': false
    },
    'listTitle': {
        'name': 'headerTitle',
        'isToggle': false
    },
    'columns': {
        'name': 'columns',
        'isToggle': false
    },
    'maxColumns': {
        'name': 'columnLimit',
        'isToggle': false
    },
    'wordWrap': {
        'name': 'wrapCellContent',
        'isToggle': false
    },
    'columnPreferenceKey': {
        'name': 'columnPreferenceKey',
        'isToggle': false
    },
    'groupByField': {
        'name': 'groupByField',
        'isToggle': false
    },
    'limit': {
        'name': 'limit',
        'isToggle': false
    },
    'hideViewAll': {
        'name': 'showViewAll',
        'isToggle': true
    },
    'hideLinks': {
        'name': 'showLinks',
        'isToggle': true
    },
    'showBorder': {
        'name': 'showBorder',
        'isToggle': false
    },
    'bare': {
        'name': 'bareBorder',
        'isToggle': false
    },
    'maxCharLimit': {
        'name': 'maxCharLimit',
        'isToggle': false
    },
    'hidePersonalization': {
        'name': 'showPersonalization',
        'isToggle': true
    },
    'hideDotWalk': {
        'name': 'hideDotWalk',
        'isToggle': false
    },
    'hideColumnReorder': {
        'name': 'showColumnReorder',
        'isToggle': true
    },
    'hideColumnGrouping': {
        'name': 'showColumnGrouping',
        'isToggle': true
    },
    'hideColumnResizing': {
        'name': 'showColumnResizing',
        'isToggle': true
    },
    'hideColumnFiltering': {
        'name': 'showColumnFiltering',
        'isToggle': true
    },
    'hideColumnSorting': {
        'name': 'showColumnSorting',
        'isToggle': true
    },
    'hideInlineEditing': {
        'name': 'showInlineEditing',
        'isToggle': true
    },
    "hideTitleRowCount": {
        'name': 'showRecordCount',
        'isToggle': true
    },
    "hideHighlightedValues": {
        "name": 'fetchHighlightedValues',
        "isToggle": true
    },
    "highlightedValueConfigId": {
        "name": "highlightedValueConfigId",
        "isToggle": false
    }
};


AnalyticsListMigrationUtils.prototype = {
    initialize: function() {},

    /**
     * Migrate a single List - Simple data visualization to Analytics List.
     * @param {Object} vizGr - The visualization record.
     */
    migrateSimpleListViz: function(vizGr) {
        if (vizGr.isValidRecord()) {
            try {
                var inputs = {};
                inputs['visualization'] = vizGr; // GlideRecord of table: par_visualization 
                var result = sn_fd.FlowAPI.getRunner().subflow('global.analyticslistmigration').inForeground().withInputs(inputs).run();
                var outputs = result.getOutputs();
                var isMigrated = outputs['ismigrated'];
                if (isMigrated) {
                    gs.info(`${MIGRATION_LOG_PREFIX} Successfuly migrated List - Simple visualization - ${vizGr.getUniqueValue()} to Analytics list.`);
                } else {
                    gs.error(`${MIGRATION_LOG_PREFIX} List - Simple visualization - ${vizGr.getUniqueValue()} to Analytics list migration failed.`);
                }

            } catch (ex) {
                gs.error(`${MIGRATION_LOG_PREFIX} List - Simple visualization - ${vizGr.getUniqueValue()} to Analytics list migration failed - ${ex.getMessage()}`);
            }

        } else {
            gs.error(`${MIGRATION_LOG_PREFIX} The given visualization record is invalid`);
        }
    },

    /**
     * Migrate a single List - Simple dashboard widget to Analytics List.
     * @param {Object} widgetGr - The dashboard widget record.
     */
    migrateSimpleListDashboardWidget: function(widgetGr) {
        if (widgetGr.isValidRecord()) {
            try {
                var inputs = {};
                inputs['dashboardwidget'] = widgetGr; // GlideRecord of table: par_dashboard_widget 
                var result = sn_fd.FlowAPI.getRunner().subflow('global.analytics_list_dashboard_widget_migration').inForeground().withInputs(inputs).run();
                var outputs = result.getOutputs();
                var isMigrated = outputs['ismigrated'];
                if (isMigrated) {
                    gs.info(`${MIGRATION_LOG_PREFIX} Successfuly migrated List - Simple dashboard widget - ${widgetGr.getUniqueValue()} to Analytics list.`);
                } else {
                    gs.error(`${MIGRATION_LOG_PREFIX} List - Simple dashboard widget - ${widgetGr.getUniqueValue()} to Analytics list migration failed.`);
                }
            } catch (ex) {
                gs.error(`${MIGRATION_LOG_PREFIX} List - Simple dashboard widget - ${widgetGr.getUniqueValue()} to Analytics list migration failed - ${ex.getMessage()}`);
            }
        } else {
            gs.error(`${MIGRATION_LOG_PREFIX} The given dashboard widget record is invalid`);
        }
    },

    /**
     * Returns JSON for analytics list component properties.
     * @param {Object} simpleListProps - The properties of the simple list.
     * @returns {string} The JSON string of the analytics list properties.
     */
    _getAnalyticsListProps: function(simpleListProps) {
        try {
            var dataSourceId = gs.generateGUID(); // Random unique id for datasource object
            var analyticsListProps = {
                'dataSources': [{
                    "allowRealTime": true,
                    "dataCategories": [
                        "trend",
                        "group",
                        "simple"
                    ],
                    "filterQuery": "",
                    "id": dataSourceId,
                    "isDatabaseView": false,
                    "preferredVisualizations": [],
                    "sourceType": "table",
                    "tableOrViewName": ''
                }],
                "additionalGroupByConfig": [],
                "allowAdditionalGroupByPerMetric": false,
                "componentId": "",
                "contextMenuActions": [],
                "description": "",
                "emptyStateAlignment": "vertical-centered",
                "emptyStateContent": "There are no scores available for the selected criteria. Contact your admin for more info.",
                "emptyStateHeading": "No data available.",
                "emptyStateHeadingLevel": 3,
                "emptyStateIllustration": "no-data",
                "enableCustomEmptyState": false,
                "enableDrilldown": true,
                "enableRealTimeUpdate": false,
                "filterConfigurations": "@state.parFilters",
                "headingLevel": 2,
                "metrics": [{
                    "aggregateFunction": "COUNT",
                    "axisId": "primary",
                    "dataSource": "dGFibGVpbmNpZGVudDE3MzYzNjA0MzU5NjM=",
                    "id": "ZEdGaWJHVnBibU5wWkdWdWRERTNNell6TmpBME16VTVOak09MTczNjM2MDQzNjgwMQ==",
                    "numberFormat": {
                        "customFormat": false
                    }
                }],
                "showAdditionalGroupBySelector": false,
                "showFilterIcon": true,
                "showHeaderSeparator": false,
                "showHeader": true,
                "showLoadingIndicator": false,
                "wrapTitle": false,
                "parFilter": "",
                "parFilterConfig": [],
                "allowListPagination": true,
                "columnLimit": 0,
                "limit": 10,
                "maxCharLimit": 40,
                "columnPreferenceKey": "",
                "bareBorder": false,
                "wrapCellContent": "useLineBreaksUserPref",
                "showPersonalization": false,
                "hideDotwalk": false,
                "showColumnReorder": true,
                "showColumnGrouping": true,
                "showColumnResizing": true,
                "showColumnFiltering": false,
                "showColumnSorting": true,
                "followFilters": true,
                "groupByField": "",
                "showLinks": true,
                "showViewAll": false,
                "showInlineEditing": true,
				"fetchHighlightedValues": true,
				"highlightedValueConfigId": ""
            };

            for (var key in simpleListProps) {
                if (LIST_PROPS_MAP.hasOwnProperty(key)) {
                    var val = simpleListProps[key];
                    // Handle table prop
                    if (key === 'table') {
                        analyticsListProps[LIST_PROPS_MAP[key].name] = val;
                        analyticsListProps.dataSources[0].tableOrViewName = val;
                    }
                    // Handle groupBy prop
                    else if (key === 'groupByField' && simpleListProps[key]) {
                        analyticsListProps[LIST_PROPS_MAP[key].name] = val;
                        analyticsListProps.groupBy = [{
                            "groupBy": [{
                                "dataSource": dataSourceId,
                                "groupByField": val,
                                "isChoice": false,
                                "isPaBucket": false,
                                "isRange": false
                            }],
                            "hideZeroValues": false,
                            "maxNumberOfGroups": 10,
                            "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
                            "showOthers": false
                        }];
                    }
                    // Handle custom filter, still need to handle fixedQuery
                    else if (key === 'query' || key === 'fixedQuery') {
                        var query = simpleListProps["query"];
                        var fixedQuery = simpleListProps["fixedQuery"];
                        if (fixedQuery && query)
                            analyticsListProps.dataSources[0].filterQuery = `${fixedQuery}^${query}`;
                        else
                            analyticsListProps.dataSources[0].filterQuery = fixedQuery || query;
                    }
                    // Handle wordWrap boolean to choice mapping
                    else if (key === 'wordWrap') {
                        if (!simpleListProps["overrideWordWrapUserPref"]) {
                            analyticsListProps[LIST_PROPS_MAP[key].name] = "useLineBreaksUserPref"; // use user preference if overrideWordWrapUserPref is false
                        } else {
                            analyticsListProps[LIST_PROPS_MAP[key].name] = val ? "wrapOn" : "wrapOff";
                        }
                    }
                    // Toggle the value of boolean props with isToggle set as true in analytics list
                    else if (LIST_PROPS_MAP[key].isToggle) {
                        analyticsListProps[LIST_PROPS_MAP[key].name] = !simpleListProps[key];
                    }
                    // For all other props just copy the value
                    else {
                        analyticsListProps[LIST_PROPS_MAP[key].name] = val;
                    }
                }
            }
            // Set the default value of columnLimit to 0 in case it was undefined in list-simple viz/widget
            if (!analyticsListProps.columnLimit)
                analyticsListProps.columnLimit = 0;

            return JSON.stringify(analyticsListProps);
        } catch (e) {
            gs.error(`${MIGRATION_LOG_PREFIX} Analytics list component properties generation failed - ${e}`);
        }
    },

    type: 'AnalyticsListMigrationUtils'
};
