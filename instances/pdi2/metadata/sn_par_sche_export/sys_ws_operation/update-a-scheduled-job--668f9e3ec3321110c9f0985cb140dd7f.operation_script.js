(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var pathparams = request.pathParams;
        var exportSysId = pathparams.export_id;
        var body = request.body.data;
        var grSysAutoPar = new GlideRecordSecure('sysauto_par');
        var vizSysIds = [];
        var dashboardSysIds = [];
        var toExportIds = [];
        if (grSysAutoPar.get(exportSysId) && grSysAutoPar.canWrite()) {
            if (body.scheduling) {
                updateNotification(grSysAutoPar.notification.toString(), body.notification);
                var exoprtIds = grSysAutoPar.to_export;

                var parExportGr = new GlideRecordSecure("par_export");
                parExportGr.addQuery("sys_id", "IN", exoprtIds);
                parExportGr.query();
                while (parExportGr.next()) {
                    switch (parExportGr.sys_class_name.toString()) {
                        case "par_export_visualization":
                            vizSysIds.push(parExportGr.getUniqueValue());
                            break;
                        case "par_export_dashboard":
                            dashboardSysIds.push(parExportGr.getUniqueValue());
                            break;
                        default:
                            continue;
                    }
                }

                toExportIds = toExportIds.concat(updateVizExport(vizSysIds, body.visualizations));
                toExportIds = toExportIds.concat(updateDashboardExport(dashboardSysIds, body.dashboards));

                updateScheduling(grSysAutoPar, body.scheduling, toExportIds);
                return {
                    status: 'Successfully update the scheduled job',
                    jobId: exportSysId
                };
            }
        } else {
            var permError = new sn_ws_err.ServiceError();
            permError.setStatus(403);
            permError.setMessage('You do not have access to edit this job.');
            permError.setDetail('You do not have permission to edit this scheduled export job');
            response.setError(permError);
        }
    } catch (e) {
        var serverError = new sn_ws_err.ServiceError();
        serverError.setStatus(500);
        serverError.setMessage("An error occurred. Scheduled job is not been updated.");
        serverError.setDetail(e.message);
        response.setError(serverError);
    }
})(request, response);

function updateScheduling(grSysAutoPar, scheduling, toExportIds) {
    if (toExportIds)
        grSysAutoPar.to_export = toExportIds.join(',');

    if (scheduling.zip !== undefined)
        grSysAutoPar.zip_output = scheduling.zip;

    if (scheduling.active !== undefined)
        grSysAutoPar.active = scheduling.active;

    if (scheduling.schedule !== undefined) {
        if (scheduling.schedule.businessCalendar !== undefined)
            grSysAutoPar.business_calendar = scheduling.schedule.businessCalendar;

        if (scheduling.schedule.time !== undefined)
            grSysAutoPar.run_time = scheduling.schedule.time;

        if (scheduling.schedule.dayOfTheMonth !== undefined)
            grSysAutoPar.run_dayofmonth = scheduling.schedule.dayOfTheMonth;

        if (scheduling.schedule.dayOfTheWeek !== undefined)
            grSysAutoPar.run_dayofweek = scheduling.schedule.dayOfTheWeek;

        if (scheduling.schedule.periodDuration !== undefined)
            grSysAutoPar.run_period = new GlideDuration(scheduling.schedule.periodDuration);

        if (scheduling.schedule.startOn !== undefined)
            grSysAutoPar.run_start = scheduling.schedule.startOn;

        if (scheduling.schedule.businessCalendarOffset !== undefined)
            grSysAutoPar.offset_type = scheduling.schedule.businessCalendarOffset;
    }

    if (scheduling.conditionCode !== undefined)
        grSysAutoPar.condition = scheduling.conditionCode;

    if (scheduling.condition !== undefined)
        grSysAutoPar.conditional = scheduling.condition;

    if (scheduling.run !== undefined)
        grSysAutoPar.run_type = scheduling.run;

    if (scheduling.name !== undefined)
        grSysAutoPar.name = scheduling.name;

    if (!grSysAutoPar.update()) {
        throw new Error('Failed to update scheduled job information. ' + grSysAutoPar.sys_id);
    }
}

function updateNotification(notificationSysId, notification) {
    var grNotification = new GlideRecordSecure('par_notification_email');
	var grEmailRecipients = new GlideRecordSecure('par_notification_email_recipients');
 
    if (grNotification.get(notificationSysId)) {
        if (notification.recipients !== undefined)
            grNotification.recipients = notification.recipients;

        if (notification.subject !== undefined)
            grNotification.subject = notification.subject;

        if (notification.message !== undefined)
            grNotification.message = notification.message;

        if (!grNotification.update()) {
            throw new Error('Failed to update scheduled job information for notification ');
        }
		else {
			if (!grEmailRecipients.get("par_notification_email", grNotification.sys_id)) {
				grEmailRecipients.initialize();
				grEmailRecipients.par_notification_email = grNotification.sys_id;
				if (notification.users !== undefined)
					grEmailRecipients.users = unmapReferences(notification.users);
				if (notification.groups !== undefined)
					grEmailRecipients.groups = unmapReferences(notification.groups);
				
				if (!grEmailRecipients.insert()) 
					throw new Error('Failed to update scheduled job information for notification ');
			}
			else {
				if (notification.users !== undefined)
					grEmailRecipients.users = unmapReferences(notification.users);
				if (notification.groups !== undefined)
					grEmailRecipients.groups = unmapReferences(notification.groups);
				
				if (!grEmailRecipients.update()) 
					throw new Error('Failed to update scheduled job information for notification ');
			}
			
		}
    }
}

function updateVizExport(exportIds, visualizations) {
    var grVisualization = new GlideRecordSecure('par_export_visualization');
    var par_export_ids = [];
    for (var i = 0; i < visualizations.length; i++) {
        var viz = visualizations[i];
        if (viz.sysId !== undefined && exportIds.indexOf(viz.sysId) !== -1) { //then we have an existing record
            if (grVisualization.get(viz.sysId)) {
                if (viz.orientation !== undefined)
                    grVisualization.orientation = viz.orientation;

                if (viz.fileType !== undefined)
                    grVisualization.file_type = viz.fileType;

                if (viz.size !== undefined)
                    grVisualization.page_size = viz.size;

                if (viz.visualization !== undefined) {
                    if (typeof viz.visualization === 'string') {
                        grVisualization.visualizations = viz.visualization;
                    } else {
                        grVisualization.visualizations = viz.visualization.id;
                    }
                }


                if (viz.smartSize !== undefined)
                    grVisualization.smart_size = viz.smartSize;

                if (viz.omitIfEmpty !== undefined)
                    grVisualization.omit_if_empty = viz.omitIfEmpty;
                if (!grVisualization.update()) {
                    throw new Error('Failed to update scheduled job information for visualization ' + JSON.stringify(viz));
                } else {
                    par_export_ids.push(grVisualization.sys_id.toString());
                }
            }
            continue;
        }
        //we didnt get an exsisting one, lets make a new one
        grVisualization.initialize();
        grVisualization.orientation = viz.orientation;
        grVisualization.file_type = viz.fileType;
        grVisualization.page_size = viz.size;
        grVisualization.visualizations = viz.visualization;
        grVisualization.smart_size = viz.smartSize;
        grVisualization.omit_if_empty = viz.omitIfEmpty;
        if (viz.visualization !== undefined) {
            if (typeof viz.visualization === 'string') {
                grVisualization.visualizations = viz.visualization;
            } else {
                grVisualization.visualizations = viz.visualization.id;
            }
        }
        if (!grVisualization.insert()) {
            throw new Error('Failed to update scheduled job information for visualization ' + JSON.stringify(viz));
        }
        par_export_ids.push(grVisualization.sys_id.toString());
    }
    var toDelete = exportIds.filter(function(x) {
        return par_export_ids.indexOf(x) === -1;
    });
    if (toDelete.length > 0) {
        var vizDelete = new GlideRecordSecure('par_export_visualization');
        vizDelete.addQuery('sys_id', 'IN', toDelete.join(','));
        vizDelete.query();
        while (vizDelete.next())
            vizDelete.deleteRecord();
    }
    return par_export_ids;
}

function updateDashboardExport(exportIds, dashboards) {
    var grDashboard = new GlideRecordSecure('par_export_dashboard');
    var par_export_ids = [];
    for (var i = 0; i < dashboards.length; i++) {
        var dashboard = dashboards[i];
        if (dashboard.sysId != undefined && exportIds.indexOf(dashboard.sysId) != -1) {
            if (grDashboard.get(dashboard.sysId)) {
                if (typeof dashboard.dashboard === 'string')
                    grDashboard.dashboard = dashboard.dashboard;
                else
                    grDashboard.dashboard = dashboard.dashboard.id;
                if (dashboard.fileType != undefined)
                    grDashboard.file_type = dashboard.fileType;
                if (dashboard.canvasList != undefined)
                    grDashboard.dashboard_canvas = dashboard.canvasList.join(',');
                if (dashboard.omitIfEmpty !== undefined)
                    grDashboard.omit_if_empty = dashboard.omitIfEmpty;
                if (dashboard.fileType != 'ppt') {
                    grDashboard.orientation = dashboard.orientation;
                    grDashboard.page_size = dashboard.size;
                }
                if (!grDashboard.update()) {
                    throw new Error('Failed to update scheduled job information for dashboard' + JSON.stringify(dashboard));
                } else {
                    par_export_ids.push(grDashboard.sys_id.toString());
                }

            }
            continue;
        }
        //we didnt get any existing dashboard export record, make new one
        grDashboard.initialize();
        grDashboard.file_type = dashboard.fileType;
        grDashboard.dashboard = dashboard.dashboard.id;
        grDashboard.dashboard_canvas = dashboard?.canvasList?.join(',');
        grDashboard.omit_if_empty = dashboard.omitIfEmpty;
        if (dashboard.dashboard != undefined) {
            if (typeof dashboard.dashboard === 'string')
                grDashboard.dashboard = dashboard.dashboard;
            else
                grDashboard.dashboard = dashboard.dashboard.id;
        }
        if (!grDashboard.insert()) {
            throw new Error('Failed to update scheduled job information for dashboard ' + JSON.stringify(dashboard));
        } else
            par_export_ids.push(grDashboard.sys_id.toString());
    }
    var toDelete = exportIds.filter(function(x) {
        return par_export_ids.indexOf(x) === -1;
    });
    if (toDelete.length > 0) {
        var dashboardDelete = new GlideRecordSecure('par_export_dashboard');
        dashboardDelete.addQuery('sys_id', 'IN', toDelete.join(','));
        dashboardDelete.query();
        while (dashboardDelete.next())
            dashboardDelete.deleteRecord();
    }
    return par_export_ids;
}

function unmapReferences(references) {
    var res = [];
    for (var i = 0; i < references.length; i++) {
        res.push(references[i].id);
    }
    return res.join(',');
}
