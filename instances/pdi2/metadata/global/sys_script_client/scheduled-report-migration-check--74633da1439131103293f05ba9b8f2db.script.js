function onLoad() {
    //Type appropriate comment here, and begin script below
    var sysautoReportSysId = g_form.getUniqueValue();;
    var gr = new GlideRecord('par_coreui_migration_bridge_sysauto');
    gr.addQuery('sysauto_report', sysautoReportSysId);
    gr.query();
    if (gr.next()) {
		if (gr.getValue('active') == 'next') {
			// Next experience is active
            migrated_scheduled_job_url = '/now/platform-analytics-workspace/scheduled-export/' + gr.sysauto_par;
            if (g_user.hasRole('report_admin')) {
                g_form.addInfoMessage(getMessage('This scheduled report has been migrated to a next experience scheduled visualization.')+' <a href="'+migrated_scheduled_job_url+'" target="_blank">'+getMessage('Click here to view the migrated scheduled visualization.')+'</a>');
            } else {
                top.window.location = migrated_scheduled_job_url;
            }
        }
    } 
}
