(function executeRule(current, previous) {
	if (current.getValue('is_real_time') === '1' /* true */) {
		var dashboardGr = new GlideRecord('sn_itam_recomm_dashboard');
		dashboardGr.addQuery('workspace', current.getUniqueValue());
		dashboardGr.query();
		while (dashboardGr.next()) {
			dashboardGr.setValue('job', '');
			dashboardGr.update();
		}
	} else {
		new global.GlideQuery('sn_itam_recomm_dashboard')
			.where('workspace', current.getUniqueValue())
			.updateMultiple({ job: current.getValue('job') });
	}
}(current, previous));
