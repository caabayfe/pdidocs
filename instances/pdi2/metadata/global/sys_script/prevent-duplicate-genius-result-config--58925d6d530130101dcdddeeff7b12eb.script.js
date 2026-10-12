(function executeRule(current, previous /*null when async*/ ) {
	var gr = new GlideRecord('ais_search_profile_ais_genius_result_configuration_m2m');
	gr.addQuery('profile', current.profile);
	gr.addQuery('genius_result_configuration', current.genius_result_configuration);
	gr.addQuery('sys_id','!=',current.sys_id);
	gr.query();
	if (gr.next()) {
	  gs.addErrorMessage(gs.getMessage('The selected genius result was not added because it is already linked to this search profile.'));
	  current.setAbortAction(true);
	}
})(current, previous);
