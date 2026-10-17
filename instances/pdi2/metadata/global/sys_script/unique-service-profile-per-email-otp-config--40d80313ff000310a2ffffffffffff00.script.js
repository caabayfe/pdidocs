(function executeRule(current, previous /*null when async*/) {

	var configGr = new GlideRecord('email_otp_service_config');
	configGr.addQuery('service_profile_table', current.service_profile_table);
	configGr.addQuery('service_profile', current.service_profile);

	if (current.operation() == 'update') {
		configGr.addQuery('sys_id', '!=', current.sys_id);
	}

	configGr.query();
	if (configGr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot save the record. A configuration already exists for this Service Profile. Please choose a different Service Profile.'));
	}

})(current, previous);
