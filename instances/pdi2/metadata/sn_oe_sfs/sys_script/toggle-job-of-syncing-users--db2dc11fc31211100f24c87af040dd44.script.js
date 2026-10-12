(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sysauto_script');
	if (!gr.get('206c86fcc32211100f24c87af040ddf1'))
		gs.addErrorMessage(gs.getMessage("Can not find the job for syncing users"));
		
	gr.setValue('active', current.enable_teams);
	gr.update();

})(current, previous);
