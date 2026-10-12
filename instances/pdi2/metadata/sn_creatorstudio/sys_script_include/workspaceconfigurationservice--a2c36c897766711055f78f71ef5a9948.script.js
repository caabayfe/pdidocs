var WorkspaceConfigurationService = Class.create();
WorkspaceConfigurationService.prototype = {
    initialize: function() {},
    constants: {
        CreatorStudioListConfiguration: 'ae8cff95779a311055f78f71ef5a99a6',
        RequestAppFulfillerRoleSuffix: 'agent'
    },

    //gets fulfiller role sys id
    getRequestAppFulfillerRole: function(appSysId) {
        if (appSysId) {
            var roleGr = new GlideRecordSecure('sys_user_role');
            roleGr.addQuery('sys_scope', appSysId);
            roleGr.addQuery('suffix', this.constants.RequestAppFulfillerRoleSuffix);
            roleGr.query();
            if (roleGr.next()) {
                return roleGr.getValue('sys_id');
            }
        }
    },

    //gets applicability record id
    getListApplicabilityId(appSysId) {
        let grApplicability = new GlideRecordSecure('sys_ux_applicability');
        grApplicability.addQuery('sys_scope', appSysId);
        grApplicability.addQuery('roles', 'CONTAINS', this.getRequestAppFulfillerRole(appSysId));
        grApplicability.query();
        if (grApplicability.next()) {
            return grApplicability.getValue('sys_id');
        }
    },

    //creates list applicability record
    createListApplicability: function(appName, appSysId) {
        const csDataProxy = new global.CreatorStudioDataProxy();
        let grApplicability = new GlideRecord('sys_ux_applicability');
        let payload = {};
        payload.name = gs.getMessage("{0} Audience", [appName]);
        payload.roles = this.getRequestAppFulfillerRole(appSysId);
        return csDataProxy.insert(grApplicability, payload);

    },

    //creates applicability m2m record
    createListApplicabilityM2M: function(listID, applicabilityID) {
        const csDataProxy = new global.CreatorStudioDataProxy();
        let grApplicabilityM2M = new GlideRecord('sys_ux_applicability_m2m_list');
        csDataProxy.insert(grApplicabilityM2M, {
            list: listID,
            applicability: applicabilityID
        });

    },

    createListCategory: function(appName) {
        let grListCategory = new GlideRecord("sys_ux_list_category");
        let listProps = {};
        listProps.title = gs.getMessage("{0} Requests", [appName]);
        listProps.configuration = this.constants.CreatorStudioListConfiguration;
        listProps.order = 100;
        let csDataProxy = new global.CreatorStudioDataProxy();
        return csDataProxy.insert(grListCategory, listProps);
    },
    createListMenuItems: function(listCategorySysId, requestTable, applicabilityID) {
        const csDataProxy = new global.CreatorStudioDataProxy();
        const defaultListColumns = ListService.getDefaultColumns(requestTable, true).join(','); //gets columns from sys_ui_list record associated with the table including Default view
        let grList = new GlideRecord('sys_ux_list');
        let open = {};
        open.category = listCategorySysId;
        open.configuration = this.constants.CreatorStudioListConfiguration;
        open.title = gs.getMessage("Open");
        open.table = requestTable;
        open.condition = "active=true^EQ";
        open.columns = defaultListColumns;
        open.order = 100;
        open.hide_quick_edit = true;
        this.createListApplicabilityM2M(csDataProxy.insert(grList, open), applicabilityID);

        let openUnassigned = {};
        openUnassigned.category = listCategorySysId;
        openUnassigned.configuration = this.constants.CreatorStudioListConfiguration;
        openUnassigned.title = gs.getMessage("Open - Unassigned");
        openUnassigned.table = requestTable;
        openUnassigned.condition = "active=true^assigned_toISEMPTY^EQ";
        openUnassigned.columns = defaultListColumns;
        openUnassigned.order = 200;
        this.createListApplicabilityM2M(csDataProxy.insert(grList, openUnassigned), applicabilityID);

        let closed = {};
        closed.category = listCategorySysId;
        closed.configuration = this.constants.CreatorStudioListConfiguration;
        closed.title = gs.getMessage("Closed");
        closed.table = requestTable;
        closed.condition = "active=false^EQ";
        closed.columns = defaultListColumns;
        closed.order = 300;
        this.createListApplicabilityM2M(csDataProxy.insert(grList, closed), applicabilityID);

        let all = {};
        all.category = listCategorySysId;
        all.configuration = this.constants.CreatorStudioListConfiguration;
        all.title = gs.getMessage("All");
        all.table = requestTable;
        all.condition = "";
        all.columns = defaultListColumns;
        all.order = 400;
        this.createListApplicabilityM2M(csDataProxy.insert(grList, all), applicabilityID);

    },

    getParDashboardPayload: function(appName, tableLabel, tableName) {
        var createComponentCardProps = function(tableLabel, tableName, filterQuery, dataSource, dataId, componentId, headerTitle) {
            var payload = {
                configVersion: "23.0.0-ci-SNAPSHOT",
                scoreSize: "md",
                headingPosition: "top",
                sparklineStyle: "area",
                scoreIcon: "",
                iconStyle: "background",
                showScoreDate: false,
                useRelativeScoreTime: false,
                showScoreUpdateTime: false,
                showZero: true,
                colorConfig: {
                    type: "default"
                },
                newReporting: false,
                additionalGroupByConfig: [],
                dataSources: [{
                    isDatabaseView: false,
                    allowRealTime: true,
                    label: tableLabel,
                    sourceType: "table",
                    tableOrViewName: tableName,
                    filterQuery: filterQuery,
                    preferredVisualizations: [
                        "d24d53f60350de7a652caf3188a46ed2"
                    ],
                    id: dataSource,
                    dataCategories: [
                        "trend",
                        "group",
                        "simple"
                    ]
                }],
                showHeader: true,
                showTotalAggregate: false,
                showSubAggregate: false,
                showFirstGroupAggregate: false,
                showSecondGroupAggregate: false,
                hideMatrixAggregate: false,
                wrapTitle: false,
                showHeaderSeparator: false,
                headerTitle: headerTitle,
                headingLevel: 2,
                showBorder: true,
                bareBorder: false,
                telemetry: null,
                showDataPassthrough: false,
                refreshRequest: "",
                showAdditionalGroupBySelector: false,
                dataPassthrough: null,
                metrics: [{
                    dataSource: dataSource,
                    id: dataId,
                    aggregateFunction: "COUNT",
                    numberFormat: {
                        customFormat: false
                    },
                    axisId: "primary"
                }],
                groupBy: null,
                sortByOrder: "desc",
                trendBy: null,
                showChange: false,
                showChangePercentage: false,
                showTarget: false,
                showForecast: false,
                showForecastRange: false,
                showTrend: false,
                showConfidenceBand: false,
                showGapPercentage: false,
                showSparkline: false,
                showMetricLabel: false,
                showThreshold: false,
                showComment: false,
                followFilters: true,
                showFilterIcon: true,
                enableRealTimeUpdate: false,
                enableDrilldown: true,
                enableClickAndStay: false,
                enableCustomEmptyState: false,
                componentId: componentId,
                emptyStateIllustration: "no-data",
                emptyStateHeading: "No data available.",
                emptyStateContent: "There are no scores available for the selected criteria. Contact your admin for more info.",
                emptyStateAlignment: "vertical-centered",
                hideDevSettings: false,
                filterConfigurations: "@state.parFilters",
                contextMenuActions: [],
                showMaximumRange: false,
                allowChangeDateRange: false,
                showDateRangeByDefault: false,
                applyDateRange: false,
                numberOfPeriods: 3,
                showAbsolutePeriod: false,
                scoreType: null,
                showChangeFrom: false,
                period: "M",
                dateFormat: "default",
                noDebounce: ""
            };
            return payload;
        };

        var openRequests = createComponentCardProps(tableLabel, tableName, "active=true", "dGFibGV4X2FhX3Rlc3RfYXBwXzFfcmVxdWVzdDE3MDAxNDg5MTc5MTY=", "ZEdGaWJHVjRYMkZoWDNSbGMzUmZZWEJ3WHpGZmNtVnhkV1Z6ZERFM01EQXhORGc1TVRjNU1UWT0xNzAwMTQ4OTE5MDAz", "a6ukoq1r", "Open Requests");

        var unassignedRequests = createComponentCardProps(tableLabel, tableName, "active=true^assigned_toISEMPTY", "dGFibGV4X2FhX3Rlc3RfYXBwXzFfcmVxdWVzdDE3MDAxNDkwMTkxOTM=", "ZEdGaWJHVjRYMkZoWDNSbGMzUmZZWEJ3WHpGZmNtVnhkV1Z6ZERFM01EQXhORGt3TVRreE9UTT0xNzAwMTQ5MDIwMzA2", "dee19bvq", "Unassigned Open Requests");

        var closedRequests = createComponentCardProps(tableLabel, tableName, "active=false^closed_atBETWEENjavascript:gs.beginningOfLast30Days()@javascript:gs.endOfToday()", "dGFibGV4X2FhX3Rlc3RfYXBwXzFfcmVxdWVzdDE3MDAxNDkwNjIxNDU=", "ZEdGaWJHVjRYMkZoWDNSbGMzUmZZWEJ3WHpGZmNtVnhkV1Z6ZERFM01EQXhORGt3TmpJeE5EVT0xNzAwMTQ5MDYzMjQz", "8x2fbils", "Closed Last 30 Days");

        var createTaskListProps = function(tableName, query, listTitle) {
            return {
                table: tableName,
                fixedQuery: query,
                listTitle: listTitle,
                columns: "",
                query: query,
                groupByField: "",
                hideViewAll: false,
                hideHighlightedValues: false,
                highlightedValueConfigId: "",
                hideHighlightContent: false,
                highlightContent: {
                    patterns: [],
                    color: ""
                },
                hideLinks: false,
                nrlLandmark: true,
                wordWrap: false,
                overrideWordWrapUserPref: false,
                maxCharLimit: 4000,
                hideEmptyStateImage: false,
                hidePersonalization: false,
                hideDotwalk: false,
                hideColumnReorder: false,
                hideRowSelector: false,
                hideColumnGrouping: false,
                hideColumnResizing: false,
                hideColumnFiltering: false,
                hideColumnSorting: false,
                hideHeader: false,
                hideTitle: false,
                hideTitleRowCount: false,
                hideLastRefreshedText: false,
                hideRefreshButton: false,
                hideInlineEditing: false,
                refreshRequested: ""
            };
        };

        var activeTasks = createTaskListProps(tableName, "active=true", "All Active Tasks");

        var payload = {
            name: appName + ' Requests',
            description: 'Requests for ' + appName,
            certified: false,
            visibility: [{
                sys_id: '53ba520177d2311055f78f71ef5a99e8',
                name: appName + ' Workspace',
                table: 'sys_ux_page_registry',
            }, ],
            layout: {
                top_layout: [],
                tabs: [{
                    name: 'Tab',
                    order: 0,
                    layout: [{
                            x: 0,
                            y: 3,
                            h: 12,
                            w: 16,
                            component_props: JSON.stringify(openRequests),
                            component_id: 'd24d53f60350de7a652caf3188a46ed2',
                            uuid: '81bc0b67-a64d-45c0-a107-61548de7343b',
                            is_dirty: true,
                        },
                        {
                            x: 16,
                            y: 3,
                            h: 12,
                            w: 16,
                            component_props: JSON.stringify(unassignedRequests),
                            component_id: 'd24d53f60350de7a652caf3188a46ed2',
                            uuid: '5d37a22d-a903-4b26-9f24-008aacb98321',
                            is_dirty: true,
                        },
                        {
                            x: 32,
                            y: 3,
                            h: 12,
                            w: 16,
                            component_props: JSON.stringify(closedRequests),
                            component_id: 'd24d53f60350de7a652caf3188a46ed2',
                            uuid: '8bfd0a0e-4bda-494a-930a-40a0da0ca8b7',
                            is_dirty: true,
                        },
                        {
                            x: 0,
                            y: 15,
                            h: 20,
                            w: 48,
                            component_props: JSON.stringify(activeTasks),
                            component_id: '2b1c080881e05dc63b917044290b233f',
                            uuid: 'de52956e-6e04-4482-9ecc-0efa3aef12f6',
                            is_dirty: true,
                        },
                    ],
                    parFilters: {
                        parFilters: [],
                        encodedQueries: {},
                    },
                    sys_id: '5fb835297762311055f78f71ef5a99a5',
                    is_dirty: true,
                    background_color: '',
                }, ],
            },
            refresh_configuration: {
                refresh_information: false,
                scheduled_repetition: false,
            },
            insight_configuration: {
                show_insights_panel: true,
                include_trends: true,
                include_kpi_signals: true,
                include_key_contributors: true,
                include_thresholds: true,
                include_target: true,
                include_predictive_target: true,
                include_custom_insights: true,
                include_predictive_thresholds: true,
                include_severity: true,
                include_process_mining: false,
            },
            background_color: '',
            use_custom_tab_colors: false,
        };
        return payload;
    },

    createParDashboard: function(appName, tableName, role) {
        var tableGr = new GlideRecordSecure(tableName);
        var tableLabel = tableGr.getClassDisplayValue();

        try {
            var payload = this.getParDashboardPayload(appName, tableLabel, tableName);

            var dashUtil = new sn_dashboard_api.PARDashboardUtil();
            var parObject = JSON.parse(dashUtil.createInlineDashboard(JSON.stringify(payload)));
            var dashboardId = parObject.sys_id;

            dashUtil.upsertSharing(dashboardId, JSON.stringify([{
                sysId: role,
                permission: 'READ',
                canEdit: true,
                canDelete: true,
                type: 'role',
                sublabel: 'Role',
                new: true,
            }]));

            return dashboardId;
        } catch (e) {
            gs.debug(e);
            return null;
        }
    },
    type: 'WorkspaceConfigurationService'
};
