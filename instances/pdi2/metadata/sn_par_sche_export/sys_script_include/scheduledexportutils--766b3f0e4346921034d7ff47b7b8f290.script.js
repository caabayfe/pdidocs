var ScheduledExportUtils = Class.create();
ScheduledExportUtils.prototype = {
    initialize: function() {},
    createScheduledExport: function(visualizations, dashboards, notification, scheduling) {
        var parExportIds = [];
        try {
            if (Array.isArray(visualizations) && visualizations.length > 0) {
                parExportIds = parExportIds.concat(this.saveVisualizations(visualizations));
            }
            if (Array.isArray(dashboards) && dashboards.length > 0) {
                parExportIds = parExportIds.concat(this.saveDashboards(dashboards));
            }
            if (!parExportIds || parExportIds.size === 0) {
                return;
            }
            var notificationSysId = this.saveNotification(notification);
            if (!notificationSysId) {
                return;
            }
            var jobSysId = this.saveJob(scheduling, parExportIds.toString(), notificationSysId);
            if (!jobSysId) {
                return;
            }
            return {
                statusMessage: "Successfully created the scheduled job",
                statusCode: 200,
                jobId: jobSysId.toString()
            };
        } catch (e) {
            return {
                statusMessage: "Failed to create the scheduled job",
                statusCode: 403,
                errorMessage: "[ScheduledExportUtils.saveJob]: " + e,
                jobId: null
            };
        }
    },
    saveVisualizations: function(visualizations) {
        var grVisualization = new GlideRecordSecure('par_export_visualization');
        if (!grVisualization.canCreate()) {
            gs.error("[ScheduledExportUtils.saveVisualizations]: You do not have permission to scheduled visualizations");
            throw new Error('You do not have permission to scheduled visualizations');
        }
        var parVizExportIds = [];
        for (var i = 0; i < visualizations.length; i++) {
            grVisualization.initialize();
            var viz = visualizations[i];
            grVisualization.orientation = viz.orientation;
            grVisualization.file_type = viz.fileType;
            grVisualization.page_size = viz.size;
            if (viz.visualization !== undefined) {
                if (typeof viz.visualization === 'string') {
                    grVisualization.visualizations = viz.visualization;
                } else {
                    grVisualization.visualizations = viz.visualization.id;
                }
            }
            grVisualization.smart_size = viz.smartSize;
            grVisualization.omit_if_empty = viz.omitIfEmpty;
            if (!grVisualization.insert()) {
                gs.error("[ScheduledExportUtils.saveVisualizations]: Failed to insert scheduled job information for visualization " + JSON.stringify(viz));
                throw new Error('Failed to insert scheduled job information for visualization ' + JSON.stringify(viz));
            }
            parVizExportIds.push(grVisualization.sys_id.toString());
        }
        return parVizExportIds;
    },
    saveDashboards: function(dashboards) {
        var grDashboard = new GlideRecordSecure('par_export_dashboard');
        if (!grDashboard.canCreate()) {
            gs.error("[ScheduledExportUtils.saveDashboards]: You do not have permission to scheduled dashboards");
            throw new Error('You do not have permission to scheduled dashboards');
        }
        var parDashboardExportIds = [];
        for (var i = 0; i < dashboards.length; i++) {
            grDashboard.initialize();
            var dashboard = dashboards[i];
            grDashboard.file_type = dashboard.fileType;
            grDashboard.dashboard_canvas = dashboard.canvasList.join(',');
            grDashboard.omit_if_empty = dashboard.omitIfEmpty;
            if (typeof dashboard.dashboard === 'string')
                grDashboard.dashboard = dashboard.dashboard;
            else
                grDashboard.dashboard = dashboard.dashboard.id;
            if (!grDashboard.insert()) {
                throw new Error('Failed to insert scheduled job information for dashboard ' + JSON.stringify(dashboard));
            }
            parDashboardExportIds.push(grDashboard.sys_id.toString());
        }
        return parDashboardExportIds;
    },
    saveNotification: function(notification) {
        var grNotification = new GlideRecordSecure('par_notification_email');
        var grEmailRecipients = new GlideRecordSecure('par_notification_email_recipients');
        if (!grNotification.canCreate()) {
            gs.error("[ScheduledExportUtils.saveNotification]: You do not have permission to configure notifications");
            throw new Error('You do not have permission to configure notifications');
        }
        grNotification.initialize();
        grNotification.recipients = notification.recipients;
        grNotification.subject = notification.subject;
        grNotification.message = notification.message;
        if (!grNotification.insert()) {
            throw new Error('Failed to insert scheduled job information for notification ');
        }
        grEmailRecipients.initialize();
        grEmailRecipients.users = this.unmapReferences(notification.users);
        grEmailRecipients.groups = this.unmapReferences(notification.groups);
        grEmailRecipients.par_notification_email = grNotification.sys_id;
        if (!grEmailRecipients.insert()) {
            throw new Error('Failed to insert scheduled job information for notification ');
        }
        return grNotification.sys_id;
    },

    saveJob: function(scheduling, toExportIds, notificationSysId) {
        var grSysAutoPar = new GlideRecordSecure('sysauto_par');
        if (!grSysAutoPar.canCreate()) {
            gs.error("[ScheduledExportUtils.saveJob]: You do not have permission to scheduled par export jobs");
            throw new Error('You do not have permission to scheduled par export jobs');
        }
        grSysAutoPar.initialize();
        grSysAutoPar.to_export = toExportIds;
        grSysAutoPar.notification = notificationSysId;
        grSysAutoPar.zip_output = scheduling.zip;
        grSysAutoPar.active = scheduling.active;
        grSysAutoPar.business_calendar = scheduling.schedule.businessCalendar;
        grSysAutoPar.condition = scheduling.conditionCode;
        grSysAutoPar.conditional = scheduling.condition;
        grSysAutoPar.run_time = scheduling.schedule.time;
        grSysAutoPar.run_dayofmonth = scheduling.schedule.dayOfTheMonth;
        grSysAutoPar.run_dayofweek = scheduling.schedule.dayOfTheWeek;
        grSysAutoPar.run_period = new GlideDuration(scheduling.schedule.periodDuration);
        grSysAutoPar.run_start = scheduling.schedule.startOn;
        grSysAutoPar.run_type = scheduling.run;
        grSysAutoPar.offset_type = scheduling.schedule.businessCalendarOffset;
        grSysAutoPar.name = scheduling.name;

        if (!grSysAutoPar.insert()) {
            throw new Error('Failed to insert scheduled job information');
        }
        return grSysAutoPar.sys_id;
    },
    unmapReferences: function(references) {
        var res = [];
        for (var i = 0; i < references.length; i++) {
            res.push(references[i].id);
        }
        return res.join(',');
    },


    type: 'ScheduledExportUtils'
};
