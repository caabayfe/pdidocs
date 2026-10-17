var AnalyticsCenterUtil = Class.create();
AnalyticsCenterUtil.prototype = {
    initialize: function() {
        this.SUCCESS = 'success';
        this.FAILED = 'failed';
        this.PAR_VISUALIZATION = 'par_visualization';
        this.PA_INDICATORS = 'pa_indicators';
        this.PAR_COMPONENT_FILTER = 'par_component_filter';
        this.SYSAUTO_PAR = "sysauto_par";
    },

    deleteDashboards: function(tableName, dashboardSysIds) {
        var result = {};
        result.status = this.SUCCESS;
        var failedOperationDashboards = [];
        var dashboardRecord = new GlideRecordSecure(tableName);
        dashboardRecord.addQuery('sys_id', 'IN', dashboardSysIds);
        dashboardRecord.query();
        if (!dashboardRecord.hasNext()) {
            result.status = this.FAILED;
            return result;
        }

        while (dashboardRecord.next()) {
            if (!dashboardRecord.deleteRecord()) {
                failedOperationDashboards.push({
                    name: dashboardRecord.getValue('name'),
                    sysId: dashboardRecord.getValue('sys_id')
                });
            }
        }

        if (failedOperationDashboards.length != 0) {
            result.status = this.FAILED;
            result.failedOperationDashboards = failedOperationDashboards;
        }

        return result;
    },

    updateDashboards: function(tableName, dashboardSysIds, columns) {
        var result = {};
        result.status = this.SUCCESS;
        var failedOperationDashboards = [];
        var dashboardRecord = new GlideRecordSecure(tableName);
        dashboardRecord.addQuery('sys_id', 'IN', dashboardSysIds);
        dashboardRecord.query();
        if (!dashboardRecord.hasNext()) {
            result.status = this.FAILED;
            return result;
        }

        while (dashboardRecord.next()) {
            for (var key in columns)
                dashboardRecord[key] = columns[key];

            if (!dashboardRecord.update()) {
                failedOperationDashboards.push({
                    name: dashboardRecord.getValue('name'),
                    sysId: dashboardRecord.getValue('sys_id')
                });
            }
        }

        if (failedOperationDashboards.length != 0) {
            result.status = this.FAILED;
            result.failedOperationDashboards = failedOperationDashboards;
        }

        return result;
    },

    updateMetadataRecords: function(metadataTableName, sourceTableRecord, columnName) {
        // Insert or update the metadata records
        var sysId = sourceTableRecord.dashboard || sourceTableRecord.sys_id;
        var metadata = new GlideRecord(metadataTableName);
        metadata.addQuery(columnName, sysId);
        metadata.query();

        if (metadata.next()) {
            this.updateDetails(sourceTableRecord, metadata, columnName);
            metadata.update();
        } else {
            metadata.initialize();
            this.updateDetails(sourceTableRecord, metadata, columnName);
            metadata.insert();
        }

        metadata.close();
    },

    updateLastDeactivatedOn: function(metadataTableName, currentRecord, columnName) {
        var glideRecord = new GlideRecordSecure(metadataTableName);
        glideRecord.addQuery(columnName, currentRecord.sys_id);
        glideRecord.query();
        if (glideRecord.next()) {
            if (currentRecord.active == false)
                glideRecord.setValue('last_deactivated_on', new GlideDateTime(new Date()));
            else
                glideRecord.setValue('last_deactivated_on', '');

            glideRecord.update();
        }
    },

    canICreateDashboard: function() {
        return SNC.DashboardACLUtilScriptable.canICreateDashboard();
    },

    canICreateDataVisualization: function() {
        var visualizationRecord = new GlideRecord(this.PAR_VISUALIZATION);
        return visualizationRecord.canCreate();
    },

    canICreatePAIndicators: function() {
        var indicatorRecord = new GlideRecord(this.PA_INDICATORS);
        return indicatorRecord.canCreate();
    },

    canICreatePARComponentFilter: function() {
        var parComponentFilterRecord = new GlideRecord(this.PAR_COMPONENT_FILTER);
        return parComponentFilterRecord.canCreate();
    },

    canICreatePARScheduledReport: function() {
        var parScheduledReportRecord = new GlideRecord(this.SYSAUTO_PAR);
        return parScheduledReportRecord.canCreate();
    },

    getUserSysId: function(userName) {
        var userRecord = new GlideRecord('sys_user');
        userRecord.addQuery('user_name', userName);
        userRecord.query();
        if (!userRecord.next())
            return '';

        return userRecord.sys_id;
    },

    updateDetails: function(current, metadata, columnName) {
        metadata[columnName] = current.dashboard || current.sys_id;
        metadata.created_by = current.created_by_user || this.getUserSysId(current.sys_created_by);
        metadata.created_on = current.created_on || current.sys_created_on;
        metadata.last_updated_by = current.updated_by_user || this.getUserSysId(current.sys_updated_by);
        metadata.last_updated_on = current.last_updated_on || current.sys_updated_on;
        metadata.last_deactivated_on = current.last_deactivated_on;
    },

    /**
     * Call ScriptableAnalyticsCenterLibraryAPI.getData()
     * @param {Object} request - Request object with properties:
     *   - tableName: string (e.g., "par_dashboard")
     *   - sortField: string (e.g., "name")
     *   - sortDir: string ("asc" or "desc")
     *   - perPage: number
     *   - page: number
     *   - filters: object (optional, e.g., {quickAccessFilterType: "recent"})
     * @returns {Object} - Parsed JSON response from the API
     */
    getAnalyticsCenterData: function(request) {
        try {
            var payload = JSON.stringify(request);
            var result = SNC.ScriptableAnalyticsCenterLibraryAPI.getData(payload);
            return JSON.parse(result);
        } catch (e) {
            gs.error('AnalyticsCenterUtils.getAnalyticsCenterData: ' + e.message);
            return null;
        }
    },

    /**
     * Call ScriptableIndicatorLibraryAPI.getIndicators()
     * @param {Object} params - Parameters object with properties:
     *   - fields: array of strings (e.g., ["ind_name", "ind_description"])
     *   - query: string (e.g., "active=true")
     *   - limit: number (default: 25)
     *   - offset: number (default: 0)
     *   - sort: string (field name to sort by)
     *   - sortDESC: boolean (default: false)
     *   - bookmarks: boolean (default: false)
     * @returns {Object} - Parsed JSON response from the API
     */
    getIndicators: function(params) {
        try {
            var result = SNC.ScriptableIndicatorLibraryAPI.getIndicators(params);
            return JSON.parse(result);
        } catch (e) {
            gs.error('AnalyticsCenterUtils.getIndicators: ' + e.message);
            return null;
        }
    },

    updateReportStatsWithLastViewedOn: function(batchSize) {
        var ga = new GlideAggregate('report_stats');
        ga.addNullQuery('last_viewed_on');
        ga.addAggregate('COUNT');
        ga.query();

        if (ga.next()) {
            var totalRows = ga.getAggregate('COUNT');
            var updatedCount = 0;

            while (updatedCount < totalRows) {
                var gr = new GlideRecord('report_stats');
                gr.addNullQuery('last_viewed_on');
                gr.setLimit(batchSize);
                gr.setWorkflow(false);
                gr.autoSysFields(false); // Prevents sys_updated_on update
                gr.query();

                if (!gr.hasNext())
                    break;

                while (gr.next()) {
                    gr.setValue('last_viewed_on', gr.getValue('sys_updated_on'));
                    gr.setWorkflow(false);
                    gr.update();
                    updatedCount++;
                }
            }
        }
    },

    setCoreUIReportsToActive: function() {
        var gr = new GlideRecord("sys_report");
        gr.setValue('active', 'true');
        gr.updateMultiple();
    },

    updateUsedInDashboard: function() {
        // For core UI reports which are used in dashboard
        this.updateMultiple('analytics_visualization_metadata', 'visualization', 'sys_portal_preferences', 'value');

        // For data visualizations which are used in any dashboard
        this.updateMultiple('analytics_visualization_metadata', 'visualization', 'par_dashboard_widget', 'stored_component');
    },

    // Set to true where the metadata.visualization points to a par_visualization/sys_report that is used in a dashboard
    // Join chain: metadata table (visualization) -> par_dashboard_widget (stored_component)
	// metadata table (visualization) -> sys_portal_preferences (value)
    updateMultiple: function(parentTable, parentColumn, childTable, childColumn) {
        var gr = new GlideRecord(parentTable);
        gr.setWorkflow(false);
        gr.autoSysFields(false);

        var joinTable = gr.addJoinQuery(childTable, parentColumn, childColumn);
        joinTable.addNotNullQuery(childColumn);

        gr.setValue('used_in_dashboard', true);
        gr.updateMultiple();
    },

    type: 'AnalyticsCenterUtil'
};
