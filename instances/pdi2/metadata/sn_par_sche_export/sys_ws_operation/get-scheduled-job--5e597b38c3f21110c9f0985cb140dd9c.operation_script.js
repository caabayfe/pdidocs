(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var pathparams = request.pathParams;
    var exportSysId = pathparams.export_id;
    var grSysAutoPar = new GlideRecordSecure('sysauto_par');
    var grSysAutoReport = new GlideRecordSecure('sysauto_report');
    var res = {
        notification: {},
        scheduling: {},
        visualizations: [],
        dashboards: [],
        metadata: {}
    };
    if (grSysAutoPar.get(exportSysId)) {
        buildScheduling(grSysAutoPar, res);
        buildNotification(grSysAutoPar, res);
        buildData(grSysAutoPar, res);
        res.name = grSysAutoPar.name.toString();
        res.metadata = {
            table: 'sysauto_par'
        };
        res.flags = {
            canDelete: grSysAutoPar.canDelete(),
            canWrite: grSysAutoPar.canWrite(),
            canExecute: !grSysAutoPar.getBooleanAttribute('disable_execute_now')
        };
        return res;
    } else if (grSysAutoReport.get(exportSysId)) {
        res.metadata = {
            table: 'sysauto_report'
        };
        return res;
    } else {
        var permError = new sn_ws_err.ServiceError();
        permError.setStatus(403);
        permError.setMessage('You do not have access to read this job.');
        permError.setDetail('You do not have permission to read this scheduled export job');
        response.setError(permError);
    }
})(request, response);

function buildData(grSysAutoPar, res) {
    var buildMap = {
        'par_export_dashboard': buildDashboards,
        'par_export_visualization': buildVisualizations
    };

    var parExportGr = new GlideRecordSecure("par_export");
    parExportGr.addQuery("sys_id", "IN", grSysAutoPar.to_export);
    parExportGr.query();
    while (parExportGr.next()) {
        var build = buildMap[parExportGr.sys_class_name];
        if (build)
            build(parExportGr.sys_id.toString(), res);
    }
    return res;
}

function buildVisualizations(sysId, res) {
    var grVisualization = new GlideRecordSecure('par_export_visualization');
    if (grVisualization.get(sysId)) {
        var parViz = grVisualization.visualizations.toString().split(',');
        var grParVisualization = new GlideRecordSecure('par_visualization');
        if (grParVisualization.get(parViz[0])) {
            var viz = {
                orientation: grVisualization.orientation.toString(),
                fileType: grVisualization.file_type.toString(),
                size: grVisualization.page_size.toString(),
                visualization: {
                    label: grParVisualization.name.toString(),
                    id: parViz[0],
                    vizType: grParVisualization.macroponent.toString()
                },
                smartSize: grVisualization.smart_size.getDisplayValue() == 'true',
                omitIfEmpty: grVisualization.omit_if_empty.getDisplayValue() == 'true',
                sysId: grVisualization.sys_id.toString()
            };
            res.visualizations.push(viz);
        } else {
            var viz = {
                orientation: grVisualization.orientation.toString(),
                fileType: grVisualization.file_type.toString(),
                size: grVisualization.page_size.toString(),
                visualization: {
                    label: parViz[0],
                    id: parViz[0],
                    vizType: '',
                    message: 'failed to get visualization with id ' + parViz[0]
                },
                smartSize: grVisualization.smart_size.getDisplayValue() == 'true',
                omitIfEmpty: grVisualization.omit_if_empty.getDisplayValue() == 'true',
                sysId: grVisualization.sys_id.toString()
            };
            res.visualizations.push(viz);

        }
    }

    return res;
}

function buildDashboards(sysID, res) {
    var grDashboard = new GlideRecordSecure("par_export_dashboard")
    if (grDashboard.get(sysID)) {
        var parDashboardGr = new GlideRecordSecure('par_dashboard');
        var dashboardId = grDashboard.getValue("dashboard");
        if (parDashboardGr.get(dashboardId)) {
            var dashboard = {
                orientation: grDashboard.orientation.toString(),
                fileType: grDashboard.file_type.toString(),
                size: grDashboard.page_size.toString(),
                canvasList: grDashboard.dashboard_canvas.toString().split(","),
                dashboard: {
                    label: parDashboardGr.getValue('name'),
                    id: dashboardId
                },
                omitIfEmpty: grDashboard.omit_if_empty.getDisplayValue() == 'true',
                sysId: grDashboard.sys_id.toString()
            };
            res.dashboards.push(dashboard);
        } else {
            var dashboard = {
                orientation: grDashboard.orientation.toString(),
                fileType: grDashboard.file_type.toString(),
                size: grDashboard.page_size.toString(),
                canvasList: grDashboard.dashboard_canvas.toString().split(","),
                dashboard: {
                    label: dashboardId,
                    id: dashboardId,
                    message: 'failed to get dashboard with id ' + dashboardId
                },
                omitIfEmpty: grDashboard.omit_if_empty.getDisplayValue() == 'true',
                sysId: grDashboard.sys_id.toString()
            };
            res.dashboards.push(dashboard);
        }
    }
    return res;
}

function buildNotification(grSysAutoPar, res) {
    res.notification.zip = grSysAutoPar.zip_output.toString() == 'true';
    res.notification.recipients = grSysAutoPar.notification.recipients.toString();
	var grNotifEmailRecipients = new GlideRecord("par_notification_email_recipients");
	if (grNotifEmailRecipients.get("par_notification_email", grSysAutoPar.notification)) {
		res.notification.users = mapReferences(grNotifEmailRecipients.users.toString(), 'sys_user');
		res.notification.groups = mapReferences(grNotifEmailRecipients.groups.toString(), 'sys_user_group');
	}
    res.notification.subject = grSysAutoPar.notification.subject.toString();
    res.notification.message = grSysAutoPar.notification.message.toString();

    return res;
}

function buildScheduling(grSysAutoPar, res) {
    res.scheduling.active = grSysAutoPar.active.getDisplayValue() == 'true';
    res.scheduling.conditionCode = grSysAutoPar.condition.toString();
    res.scheduling.condition = grSysAutoPar.conditional.getDisplayValue() == 'true';
    res.scheduling.run = grSysAutoPar.run_type.toString();

    res.scheduling.schedule = {};
    res.scheduling.schedule.time = grSysAutoPar.run_time.getDisplayValue();
    res.scheduling.schedule.dayOfTheMonth = grSysAutoPar.run_dayofmonth.toString();
    res.scheduling.schedule.dayOfTheWeek = grSysAutoPar.run_dayofweek.toString();
    res.scheduling.schedule.periodDurationAsDate = grSysAutoPar.run_period.toString();
    if (grSysAutoPar.business_calendar)
        res.scheduling.schedule.businessCalendar = grSysAutoPar.business_calendar.toString();

    res.scheduling.schedule.startOn = grSysAutoPar.run_start.toString();

    return res;
}

function mapReferences(sysIds, table) {
    var idArr = sysIds.split(',');
    var gr = new GlideRecordSecure(table);
    var res = [];
    for (var i = 0; i < idArr.length; i++) {
        if (gr.get(idArr[i])) {
            res.push({
                id: idArr[i],
                label: gr.name.toString()
            });
        }
    }
    return res;
}
