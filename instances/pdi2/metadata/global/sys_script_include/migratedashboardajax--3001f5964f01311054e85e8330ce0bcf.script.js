var MigrateDashboardAjax = Class.create();
MigrateDashboardAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    migrateDashboardsToNextExperience: function() {
        var selectedSysIds = this.getParameter('sysparm_selected_dashboards').split(',');
        this._migrateDashboards(selectedSysIds);
    },

    migrateReportsToNextExperience: function() {
        var selectedSysIds = this.getParameter("sysparm_selected_reports");
        var splittedSelectedIds = selectedSysIds.split(",");
        this._migrateReports(splittedSelectedIds);
    },

    migratePAWidgetsToNextExperience: function() {
        var selectedSysIds = this.getParameter("sysparm_selected_pa_widgets");
        var splittedSelectedIds = selectedSysIds.split(",");
        this._migratePAWidgets(splittedSelectedIds);
    },

    migrateFiltersToNextExperience: function() {
        var selectedSysIds = this.getParameter("sysparm_selected_filters");
        var splittedSelectedIds = selectedSysIds.split(",");
        this._migrateFilters(splittedSelectedIds);
    },

    migrateScheduledReportsToNextExperience: function() {
        var selectedSysIds = this.getParameter("sysparm_selected_scheduled_reports");
        var splittedSelectedIds = selectedSysIds.split(",");
        this._migrateScheduledReports(splittedSelectedIds);
    },


    paWidgetMigrationCondition: function(current) {
        // Rhino does not support indexOf or includes methods for this case.
        if (current.type == 'process' ||
            current.type == 'text')
            return false;
        if (current.visualization == 'treemap' ||
            current.visualization == 'funnel' ||
            current.visualization == 'hist' ||
            current.visualization == 'tbox' ||
            current.visualization == 'control' ||
            current.visualization == 'pyramid' ||
            current.visualization == 'spider' ||
            current.visualization == 'relative')
            return false;

        // not supporting 'Previous period chart'
        if (current.type == 'time' && current.is_compare_chart)
            return false;
        return true;
    },

    _migrateReports: function(reportSysIdList) {
        var migrationService = new SNC.MigrationServiceScriptable();
        var newMigratedReportList = [];
        var errMessageList = [];
        for (var i = 0; i < reportSysIdList.length; i++) {
            var res = migrationService.migrateReport(reportSysIdList[i]);
            this._processVizResponse(JSON.parse(res), reportSysIdList[i], newMigratedReportList, errMessageList, this._getMigratedArtifactTypeLabel('Report'));
        }
        this._fixMigratedReportContentRecords(newMigratedReportList);
        this._setCoreUIInActive(newMigratedReportList);
        this._displayMessage(newMigratedReportList, errMessageList, 'Report');
    },

    _migrateScheduledReports: function(scheduledReportSysIdList) {
        var migrationService = new SNC.MigrationServiceScriptable();
        var newMigratedReportList = [];
        var errMessageList = [];
        for (var i = 0; i < scheduledReportSysIdList.length; i++) {
            // check if report already migrated and activated
            var activeExperience = 'coreui';
            var grScheduledReport = new GlideRecord('sysauto_report');
            var reportSysId = '';
            if (grScheduledReport.get(scheduledReportSysIdList[i])) {
                reportSysId = grScheduledReport.report;
            }

            var res = migrationService.migrateScheduledReport(reportSysId, true, true);
            this._processVizResponse(JSON.parse(res), reportSysId, newMigratedReportList, errMessageList, this._getMigratedArtifactTypeLabel('Scheduled Report'));
        }
        this._fixMigratedReportContentRecords(newMigratedReportList);
        //this._setCoreUIInActive(newMigratedReportList);
        this._displayMessage(newMigratedReportList, errMessageList, 'Scheduled Report');
    },

    _migrateDashboards: function(dashboardSysIdList) {
        var migrationService = new SNC.MigrationServiceScriptable();
        var newMigratedDashboardList = [];
        var errMessageList = [];
        for (var i = 0; i < dashboardSysIdList.length; i++) {
            var res = migrationService.migrateDashboard(dashboardSysIdList[i]);
            this._processResponse(JSON.parse(res), dashboardSysIdList[i], newMigratedDashboardList, errMessageList);
        }
        this._fixMigratedContentRecords(newMigratedDashboardList);
        this._displayMessage(newMigratedDashboardList, errMessageList, 'Dashboard');
    },

    _migratePAWidgets: function(widgetSysIdList) {
        var migrationService = new SNC.MigrationServiceScriptable();
        var newMigratedWidgetList = [];
        var errMessageList = [];
        for (var i = 0; i < widgetSysIdList.length; i++) {
            var res = migrationService.migratePAWidget(widgetSysIdList[i]);
            this._processVizResponse(JSON.parse(res), widgetSysIdList[i], newMigratedWidgetList, errMessageList, this._getMigratedArtifactTypeLabel('PA widget'));
        }
        this._fixMigratedReportContentRecords(newMigratedWidgetList);
        this._displayMessage(newMigratedWidgetList, errMessageList, 'PA widget');
    },

    _migrateFilters: function(filterSysIdList) {
        var migrationService = new SNC.MigrationServiceScriptable();
        var newMigratedFilterList = [];
        var errMessageList = [];
        for (var i = 0; i < filterSysIdList.length; i++) {
            var res = migrationService.migrateFilter(filterSysIdList[i]);
            this._processVizResponse(JSON.parse(res), filterSysIdList[i], newMigratedFilterList, errMessageList, this._getMigratedArtifactTypeLabel('Filter'));
        }
        this._fixMigratedReportContentRecords(newMigratedFilterList);
        this._displayMessage(newMigratedFilterList, errMessageList, 'Filter');
    },

    _processVizResponse: function(res, legacyReportId, newMigratedReportList, errorMessageList, migratedArtifactTypeLabel) {
        var msg = '';
        if (gs.nil(res)) {
            msg = gs.getMessage('Migrating legacy {1} with id:{0} return no response.\n', [legacyReportId, migratedArtifactTypeLabel]);
            errorMessageList.push(msg);
            return;
        }
        if (res.status == "Fail") {
            errorMessageList.push(res.message); //message comes from the server already translated
            return;
        }
        newMigratedReportList.push({
            newId: res.id,
            legacyId: legacyReportId
        });
    },

    _processResponse: function(res, legacyDashboardId, newMigratedDashboardList, errorMessageList) {
        var msg = '';
        if (gs.nil(res)) {
            msg = gs.getMessage('Migrating legacy dashboard with id:{0} return no response.\n', legacyDashboardId);
            errorMessageList.push(msg);
            return;
        }
        if (res.status == "Fail") {
            errorMessageList.push(res.message); //message comes from the server already translated
            return;
        }
        newMigratedDashboardList.push({
            newId: res.id
        });
    },

    _displayMessage: function(newMigratedList, errMessageList, migratedArtifactType) {
        var msg;
        var length = newMigratedList.length;
        if (length > 0) {
            var newIds = [];
            for (var i = 0; i < newMigratedList.length; i++) {
                newIds.push(newMigratedList[i].newId);
            }
            var libraryPageUrl = '/now/platform-analytics-workspace/pages/params/library/';
            var libraryType = '';
            var libraryTable = '';

            switch (migratedArtifactType) {
                case 'Dashboard':
                    libraryPageUrl += 'dashboards';
                    libraryType = gs.getMessage('Dashboard');
                    libraryTable = 'par_dashboard';
                    break;
                case 'Report':
                case 'PA widget':
                    libraryPageUrl += 'data-visualizations';
                    libraryType = gs.getMessage('Data visualizations');
                    libraryTable = 'par_visualization';
                    break;
                case 'Filter':
                    libraryPageUrl += 'filters';
                    libraryType = gs.getMessage('Filters');
                    libraryTable = 'par_component_filter';
                    break;
                case 'Scheduled Report':
                    libraryPageUrl += 'scheduled-exports';
                    libraryType = gs.getMessage('Scheduled exports');
                    libraryTable = 'sysauto_par';
                    break;

            }

            var tinyUrlList = new GlideTinyURL().createTinyURL(
                libraryTable + "_list.do?sysparm_query=sys_idIN" + newIds
            );

            var migratedArtifactTypeLabel = this._getMigratedArtifactTypeLabel(migratedArtifactType);

            var msgArgs = [
                tinyUrlList,
                libraryPageUrl,
                migratedArtifactTypeLabel,
                libraryType
            ];

            msg = gs.getMessage('Your <a href="{0}">migrated {2}</a> is available in the <a href="{1}">{3} Library</a>.', msgArgs);

            gs.addInfoMessage(msg);
        }
        if (errMessageList.length > 0) {
            msg = gs.getMessage('{0} {2} failed to migrate with the following reasons: {1}', [errMessageList.length + '', errMessageList.join(), migratedArtifactTypeLabel]);
            gs.addErrorMessage(msg);
        }
    },

    _getMigratedArtifactTypeLabel: function(migratedArtifactType) {
        switch (migratedArtifactType) {
            case 'Dashboard':
                return gs.getMessage('Dashboard');
            case 'Report':
                return gs.getMessage('Report');
            case 'PA widget':
                return gs.getMessage('PA widget');
            case 'Filter':
                return gs.getMessage('Filter');
            case 'Scheduled Report':
                return gs.getMessage('Scheduled Report');
            default:
                return '';
        }
    },


    rollback: function() {
        if (!gs.hasRole('admin,dashboard_admin'))
            gs.error('Insufficient privilege to perform this action.');

        var selectedSysIds = this.getParameter('sysparm_selected_dashboards');
        var isUnifiedAnalyticsEnabled = gs.getProperty('com.glide.par.unified_analytics.enabled', 'false') == 'true';
        var activeIn = isUnifiedAnalyticsEnabled ? 'core' : '';

        var migrationService = new SNC.MigrationServiceScriptable();
        var res = JSON.parse(migrationService.rollbackDashboards(selectedSysIds, activeIn));
        if (res.status == 'Fail') {
            gs.addErrorMessage(res.message);
            return;
        }
        gs.addInfoMessage(gs.getMessage('{0} dashboards were rolled back successfully.', res.count));
    },

    isAllowedToRollBack: function(dashboardId) {
        if (gs.nil(dashboardId))
            return false;

        var prop = gs.getProperty("com.glide.par.unified_analytics.enabled", "");

        //As long as unified analytics property exists and have either true or false value, we will allow the rollback
        if (!gs.nil(prop) && (prop == "true" || prop == "false"))
            return this._isCoreUiVersionAvailable(dashboardId);

        return false;
    },

    _isCoreUiVersionAvailable: function(nextExpDashboardId) {
        if (gs.nil(nextExpDashboardId))
            return false;

        var gr = new GlideRecord('par_coreui_migration_bridge_dashboard');
        if (!gr.get('par_dashboard', nextExpDashboardId))
            return false;

        //We don't rollback what is already rolled back
        if (gr.getValue('active') == "core")
            return false;

        var coreDashboardId = gr.getValue("pa_dashboard");
        return !gs.nil(coreDashboardId);
    },

    deleteNextExperienceDashboards: function() {
        var selectedSysIds = this.getParameter('sysparm_selected_dashboards_to_delete');
        this._deleteNextExperienceDashboards(selectedSysIds);
    },

    _deleteNextExperienceDashboards: function(coreUiDashboards) {
        var migrationService = new SNC.MigrationServiceScriptable();
        var res = JSON.parse(migrationService.deleteNextExperienceDashboard(coreUiDashboards));
        if (res.status == "Fail") {
            gs.addErrorMessage(res.message); //message comes from the server already translated
            return;
        }
        gs.addInfoMessage(gs.getMessage('Next Experience Dashboards were deleted successfully.'));
    },

    _fixMigratedReportContentRecords: function(reportIds) {
        gs.info("Inside _fixMigratedReportContentRecords " + reportIds.length);
        for (var i = 0; i < reportIds.length; i++) {
            var newReportId = reportIds[i].newId;
            this._saveVisualization(newReportId);
            this._saveStoredComponent(newReportId);
        }
    },

    _fixMigratedContentRecords: function(dashboardIds) {
        for (var i = 0; i < dashboardIds.length; i++) {
            dashboardId = dashboardIds[i];
            //Add Dashboard Tabs
            this._updateRecord('par_dashboard_tab', dashboardId);

            //Add related canvas records
            var canvasGR = new GlideRecord('par_dashboard_canvas');
            canvasGR.addQuery('dashboard', dashboardId);
            canvasGR.query();
            while (canvasGR.next()) {
                this._saveGR(canvasGR);
                this._saveWidgets(canvasGR.getUniqueValue());
            }

            //Add related dashboard visibility
            //We won't copy the experience as it is instance specific and shouldn't be copied between instances
            this._updateRecord('par_dashboard_visibility', dashboardId);

            //Add related filters
            this._updateRecord('par_dashboard_filter', dashboardId);

            //Add dashboard metadata
            this._updateRecord('par_dashboard_user_metadata', dashboardId);

            //Add related permissions
            this._updateRecord('par_dashboard_permission', dashboardId);

            //Add category records
            this._updateCategoryArtifacts(dashboardId);
        }
    },

    _updateRecord: function(table, dashboardId) {
        var gr = new GlideRecord(table);
        gr.addQuery('dashboard', dashboardId);
        gr.query();
        while (gr.next()) {
            try {
                this._saveGR(gr);
            } catch (error) {
                gs.log('cannot update ' + table);
            }
        }
    },

    _setCoreUIInActive: function(reportIds) {
        var legacyIds = reportIds.map(function(obj) {
            return obj.legacyReportId;
        });

        if (legacyIds.length === 0) return;

        var coreUIReport = new GlideRecord("sys_report");
        coreUIReport.addQuery('sys_id', 'IN', legacyIds.join(','));
        coreUIReport.query();

        while (coreUIReport.next()) {
            // Do whatever you need to do with each matching report
            coreUIReport.setValue('active', false); // Example
            coreUIReport.update();
        }
    },

    _saveWidgets: function(canvasSysId) {
        var widgetGR = new GlideRecord('par_dashboard_widget');
        widgetGR.addQuery('canvas', canvasSysId);
        widgetGR.query();
        while (widgetGR.next()) {
            this._saveGR(widgetGR);
            this._saveVisualization(widgetGR.getValue('visualization'));
            this._saveStoredComponent(widgetGR.getValue('stored_component'));
        }
    },

    _saveVisualization: function(visualizationSysId) {
        var visualizationGR = new GlideRecord('par_visualization');
        if (visualizationGR.get(visualizationSysId))
            this._saveGR(visualizationGR);

    },

    _saveStoredComponent: function(storedComponentSysId) {
        var parComponentGR = new GlideRecord('par_component');
        if (parComponentGR.get(storedComponentSysId)) {
            this._saveGR(parComponentGR);
            var table = parComponentGR.sys_class_name;

            //Add par_component_permission
            if ('par_visualization' == table) {
                var visGR = new GlideRecord('par_visualization_permission');
                if (visGR.get(parComponentGR.getUniqueValue()))
                    this._saveGR(visGR);
            } else if ('par_component_filter' == table) {
                var filterGR = new GlideRecord('par_component_filter_permission');
                if (filterGR.get(parComponentGR.getUniqueValue()))
                    this._saveGR(filterGR);
            }
        }
    },

    _saveGR: function(gr) {
        var count = parseInt(gr.getValue('sys_mod_count'));
        gr.setValue('sys_mod_count', count + 1);
        gr.update();
    },

    _updateCategoryArtifacts: function(dashboardID) {
        var gr = new GlideRecord('analytics_category_m2m');
        gr.addQuery('type', 'par_dashboard');
        gr.addQuery('artifact_id', dashboardID);
        gr.query();
        while (gr.isValid() && gr.next()) {
            this._saveGR(gr);
            this._updateCategory(gr.getValue('category'));
        }
    },

    _updateCategory: function(categoryId) {
        var gr = new GlideRecord('analytics_category');
        if (gr.isValid() && !gr.get(categoryId))
            return;

        this._saveGR(gr);
    },

    type: 'MigrateDashboardAjax'
});
