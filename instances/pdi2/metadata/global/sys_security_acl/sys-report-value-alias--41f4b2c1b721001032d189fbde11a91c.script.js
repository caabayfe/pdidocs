var answer = false;
(function () {
	if (!gs.nil(current.field_alias)) {
		var fieldAlias = new GlideRecord('sys_report_field_alias');
		if (fieldAlias.isValid()) {
			fieldAlias.setWorkflow(false);
			if (fieldAlias.get('sys_id', current.field_alias)) {
				if (gs.nil(fieldAlias.report)) {
					answer = true;
				} else {
					var report = new GlideRecord('sys_report');
					if (report.isValid()) {
						report.setWorkflow(false);
						if (report.get('sys_id', fieldAlias.report))
							answer = report.canRead();
					}
				}
			}
		}
	}
}());
