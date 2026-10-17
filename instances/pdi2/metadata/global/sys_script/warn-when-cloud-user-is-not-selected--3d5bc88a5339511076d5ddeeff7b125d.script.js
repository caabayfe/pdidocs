(function executeRule(current, previous /*null when async*/) {

	var message = gs.getMessage('ATF_TG:contact_admin_to_set_cloud_runner_user');
	if (gs.hasRole('admin'))
		message = gs.getMessage("ATF_TG:check_for_cloud_runner_user", 'href="/now/sn_atf_tg/set-user-credentials" style="display: contents;" target="_blank"');

	gs.addInfoMessage(message);

	if (current.isNewRecord() || !current.run_in_cloud) {
		// Without a cloud user, disable run_in_cloud for new records
		// Allow unchecking on existing records where run_in_cloud is true
		g_scratchpad.disableRunInCloud = "true";
	}

})(current, previous);
