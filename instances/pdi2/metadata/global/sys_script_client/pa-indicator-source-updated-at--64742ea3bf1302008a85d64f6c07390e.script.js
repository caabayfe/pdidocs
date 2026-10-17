function onLoad() {
	// Check sys_report_source.sys_updated_on (UTC) with updated_at
	var reportSource = g_form.getValue('report_source');
    if (reportSource != null) {
		var gr = new GlideRecord('sys_report_source');
		if (gr.get(reportSource)) {
		    var updatedAt = gr.getValue('sys_updated_on').toString();
			// convert from user date time format to the internal format 
			var lastUsed = formatDate(new Date(getDateFromFormat(g_form.getValue('report_source_updated_at'), g_user_date_time_format)),'yyyy-MM-dd HH:mm:ss');
			
			if (updatedAt > lastUsed) {
				g_form.addWarningMessage(getMessage('The report source has been updated recently. You may want to update the indicator source by pressing the refresh button'));
			}
		}
	}
}
