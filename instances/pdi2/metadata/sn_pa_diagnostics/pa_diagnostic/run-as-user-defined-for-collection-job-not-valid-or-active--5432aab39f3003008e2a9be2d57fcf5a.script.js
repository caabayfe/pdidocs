function executeDiagnostic(id) {
	var result = [];
	var job = new GlideRecord('sysauto_pa');
	if (id)
		job.addEncodedQuery('sys_idIN' + id);
	job.query();
	while (job.next()) {
		if (!gs.nil(job.run_as)) {
			var user = new GlideRecord('sys_user');
			if (user.get(job.run_as)) {
				if (user.active == true && !gs.nil(user.user_name)) {
					continue;
				}
			}
		}
		result.push(job.getValue('sys_id'));
	}
	return result.join(',');
}

executeDiagnostic(id);
