(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_authentication_factors_service_config');
	gr.addQuery('authentication_factor_id', current.getValue('authentication_factor_id'));

	if (gs.nil(current.service_profile)) {
		gr.addNullQuery('service_profile');
	} else {
		gr.addQuery('service_profile', current.getValue('service_profile'));
	}

	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();

	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('A record with this Authentication Factor and Service Profile combination already exists.'));
	}

})(current, previous);
