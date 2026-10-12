(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var body = request.body.data;
        var notification = body.notification;
        var scheduling = body.scheduling;
        var parExportIds = [];

        if (!scheduling || Object.keys(scheduling).length === 0 || !scheduling.schedule || Object.keys(scheduling.schedule).length === 0 || !notification || Object.keys(notification).length === 0 || !body.visualizations || !body.dashboards || (body.visualizations.length === 0 && body.dashboards.length === 0)) {
            var invalid = new sn_ws_err.ServiceError();
            invalid.setStatus(400);
            invalid.setMessage("Invalid request parameters.");
            response.setError(invalid);
        }

        if (Array.isArray(body.visualizations) && body.visualizations.length > 0) {
            parExportIds = parExportIds.concat(saveVisualizations(body.visualizations, response));
        }
        if (Array.isArray(body.dashboards) && body.dashboards.length > 0) {
            parExportIds = parExportIds.concat(saveDashboards(body.dashboards, response));
        }
        if (!parExportIds || parExportIds.size === 0) {
            return;
        }
        var notificationSysId = saveNotification(notification, response);
        if (!notificationSysId) {
            return;
        }
        var jobSysId = saveJob(scheduling, parExportIds.toString(), notificationSysId, response);
        if (!jobSysId) {
            return;
        }
        return {
            status: "Successfully created the scheduled job",
            jobId: jobSysId.toString()
        };
    } catch (e) {
        var serverError = new sn_ws_err.ServiceError();
        serverError.setStatus(500);
        serverError.setMessage("An error occurred. Scheduled job is not created.");
        serverError.setDetail(e.message);
        response.setError(serverError);
    }
})(request, response);

function saveVisualizations(visualizations, response) {
    var grVisualization = new GlideRecordSecure('par_export_visualization');
    if (!grVisualization.canCreate()) {
        var permError = new sn_ws_err.ServiceError();
        permError.setStatus(403);
        permError.setMessage('You do not have access to create a scheduled job.');
        permError.setDetail('You do not have permission to scheduled visualizations');
        response.setError(permError);
        return;
    }
    var par_viz_export_ids = [];
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
            throw new Error('Failed to insert scheduled job information for visualization ' + JSON.stringify(viz));
        }
        par_viz_export_ids.push(grVisualization.sys_id.toString());
    }
    return par_viz_export_ids;
}

function saveDashboards(dashboards, response) {
    var grDashboard = new GlideRecordSecure('par_export_dashboard');
    if (!grDashboard.canCreate()) {
        var permError = new sn_ws_err.ServiceError();
        permError.setStatus(403);
        permError.setMessage('You do not have access to create a scheduled job.');
        permError.setDetail('You do not have permission to scheduled dashboards');
        response.setError(permError);
        return;
    }
    var par_dashboard_export_ids = [];
    for (var i = 0; i < dashboards.length; i++) {
        grDashboard.initialize();
        var dashboard = dashboards[i];
        grDashboard.orientation = dashboard.orientation;
        grDashboard.file_type = dashboard.fileType;
        grDashboard.page_size = dashboard.size;
        grDashboard.dashboard_canvas = dashboard.canvasList.join(',');
        grDashboard.omit_if_empty = dashboard.omitIfEmpty;
        if (typeof dashboard.dashboard === 'string')
            grDashboard.dashboard = dashboard.dashboard;
        else
            grDashboard.dashboard = dashboard.dashboard.id;


        if (!grDashboard.insert()) {
            throw new Error('Failed to insert scheduled job information for dashboard ' + JSON.stringify(dashboard));
        }
        par_dashboard_export_ids.push(grDashboard.sys_id.toString());
    }
    return par_dashboard_export_ids;
}


function saveNotification(notification, response) {
    var grNotification = new GlideRecordSecure('par_notification_email');
	var grEmailRecipients = new GlideRecordSecure('par_notification_email_recipients');
    if (!grNotification.canCreate()) {
        permError = new sn_ws_err.ServiceError();
        permError.setStatus(403);
        permError.setMessage('You do not have access to create a scheduled job.');
        permError.setDetail('You do not have permission to configure notifications');
        response.setError(permError);
        return;
    }
    grNotification.initialize();
	grNotification.recipients = notification.recipients;
    grNotification.subject = notification.subject;
    grNotification.message = notification.message;
    if (!grNotification.insert()) {
        throw new Error('Failed to insert scheduled job information for notification ');
    }
	grEmailRecipients.initialize();
	grEmailRecipients.users = unmapReferences(notification.users);
	grEmailRecipients.groups = unmapReferences(notification.groups);
	grEmailRecipients.par_notification_email = grNotification.sys_id;
	if (!grEmailRecipients.insert()) {
		throw new Error('Failed to insert scheduled job information for notification ');
	}
    return grNotification.sys_id;
}


function saveJob(scheduling, toExportIds, notificationSysId, response) {
    var grSysAutoPar = new GlideRecordSecure('sysauto_par');
    if (!grSysAutoPar.canCreate()) {
        permError = new sn_ws_err.ServiceError();
        permError.setStatus(403);
        permError.ssetMessage('You do not have access to create a scheduled job.');
        permError.setDetail('You do not have permission to scheduled par export jobs');
        response.setError(permError);
        return;
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
}

function unmapReferences(references) {
    var res = [];
    for (var i = 0; i < references.length; i++) {
        res.push(references[i].id);
    }
    return res.join(',');
}
