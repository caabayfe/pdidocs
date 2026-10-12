(function executeQuery(v_table, v_query) {
    var dashboardText = gs.getMessage("Dashboards");
    var vizText = gs.getMessage("Visualizations");
    var reportText = gs.getMessage("Reports");
    var dashboardAndVizText = gs.getMessage("Dashboards and Visualizations");
    var sysauto = new GlideRecordSecure('sysauto_par');
    sysauto.query();
    while (sysauto.next()) {
        try {
            var users, groups;
            var parNotifEmailRecipients = new GlideRecordSecure('par_notification_email_recipients');
            if (parNotifEmailRecipients.get("par_notification_email", sysauto.notification)) {
                users = parNotifEmailRecipients.users;
                groups = parNotifEmailRecipients.groups;
            }
            var parExportVisualizationGr = new GlideRecordSecure('par_export_visualization');
            var parExportDashboardGr = new GlideRecordSecure('par_export_dashboard');
            var parExportGr = new GlideRecordSecure("par_export");
            var parVizGr = new GlideRecordSecure("par_visualization");
            var parDashboardGr = new GlideRecordSecure("par_dashboard");
            var exoprtIds = sysauto.to_export;
            var exportItems = {
                "dashboards": [],
                "visualizations": []
            };
            var omitIfEmpty;
            parExportGr.addQuery("sys_id", "IN", exoprtIds);
            parExportGr.query();
            while (parExportGr.next()) {
                switch (parExportGr.sys_class_name.toString()) {
                    case "par_export_visualization":
                        if (parExportVisualizationGr.get(parExportGr.sys_id)) {
                            var vizId = parExportVisualizationGr.visualizations.split(',')[0];
                            if (parVizGr.get(vizId)) {
                                var viz = {
                                    "name": parVizGr.getValue("name"),
                                    "id": vizId
                                };
                                exportItems.visualizations.push(viz);
                            }

                        }
                        break;
                    case "par_export_dashboard":
                        if (parExportDashboardGr.get(parExportGr.sys_id)) {
                            var dashboardId = parExportDashboardGr.dashboard.toString();
                            if (parDashboardGr.get(dashboardId)) {
                                var dashboard = {
                                    "name": parDashboardGr.getValue("name"),
                                    "id": dashboardId
                                };
                                exportItems.dashboards.push(dashboard);
                            }

                        }
                        break;
                    default:
                        continue;
                }
            }
            if (!gs.nil(parExportVisualizationGr.omit_if_empty))
                omitIfEmpty = parExportVisualizationGr.omit_if_empty;
            else
                omitIfEmpty = parExportDashboardGr.omit_if_empty;
            var summary = dashboardAndVizText
            if (exportItems.dashboards.length == 0) {
                summary = vizText;
            }
            if (exportItems.visualizations.length == 0) {
                summary = dashboardText;
            }
            var row = {
                sys_id: sysauto.getUniqueValue(),
                active: sysauto.active,
                frequency: sysauto.run_type.getDisplayValue(),
                name: sysauto.name,
                subject: sysauto.notification.subject,
                updated: sysauto.sys_updated_on,
                updated_by: sysauto.sys_updated_by,
                condition: sysauto.condition,
                use_conditions: sysauto.conditional,
                created: sysauto.sys_created_on,
                created_by: sysauto.sys_created_by,
                day_of_the_week: sysauto.run_dayofweek,
                time: sysauto.run_time,
                omit_if_no_records: omitIfEmpty,
                send_as_zip: sysauto.zip_output,
                run_as: sysauto.run_as,
                run_as_tz: sysauto.run_as_tz,
                recipients: sysauto.notification.recipients,
                groups: groups,
                users: users,
                export_items: JSON.stringify(exportItems),
                summary: summary
            };
            v_table.addRow(row);
        } catch (e) {
            gs.warn('PAR_SCHEDULED_EXPORT: Failed generating scheduled visualization for ' + sysauto.getUniqueValue() + ' with error ' + e)
        }
    }
    if (gs.getProperty('com.glide.par.unified_analytics.enabled', false) === true || gs.getProperty('com.glide.par.unified_analytics.enabled', false) === "true") {
        var sysautoReport = new GlideRecordSecure('sysauto_report');
        sysautoReport.addQuery('active', true);
        sysautoReport.query();
        while (sysautoReport.next()) {
            try {
                var row = {
                    sys_id: sysautoReport.getUniqueValue(),
                    active: sysautoReport.active,
                    frequency: sysautoReport.run_type.getDisplayValue(),
                    name: sysautoReport.name,
                    subject: sysautoReport.report_title,
                    updated: sysautoReport.sys_updated_on,
                    updated_by: sysautoReport.sys_updated_by,
                    report: sysautoReport.report,
                    condition: sysautoReport.condition,
                    use_conditions: sysautoReport.conditional,
                    created: sysautoReport.sys_created_on,
                    created_by: sysautoReport.sys_created_by,
                    day_of_the_week: sysautoReport.run_dayofweek,
                    time: sysautoReport.run_time,
                    omit_if_no_records: sysautoReport.omit_if_no_records,
                    send_as_zip: sysautoReport.zip,
                    run_as: sysautoReport.run_as,
                    run_as_tz: sysautoReport.run_as_tz,
                    recipients: sysautoReport.address_list,
                    groups: sysautoReport.group_list,
                    users: sysautoReport.user_list,
                    export_items: JSON.stringify({
                      "reports":[
                          {
                              "name": sysautoReport.getDisplayValue("report"),
                              "id": sysautoReport.getValue('report')
                          }
                      ]
                    }),
                    summary: reportText
                };
                v_table.addRow(row);
            } catch (e) {
                gs.warn('PAR_SCHEDULED_EXPORT: Failed generating scheduled report for ' + sysautoReport.getUniqueValue() + ' with error ' + e);
            }
        }
    }
})(v_table, v_query);
