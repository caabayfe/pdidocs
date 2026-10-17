try{
	var job = new sn_oe_sfs.CollabTeamsUserSync("4bf5b90ac31211103f4fcd7b7940dd5e");
	job.sync();

	var applicationGr = new GlideRecord('sys_cs_collab_provider_application');
		applicationGr.addQuery('provider', "4bf5b90ac31211103f4fcd7b7940dd5e");
		applicationGr.addActiveQuery();
		applicationGr.query();

	if(applicationGr.next()){
		var status = applicationGr.getValue("setup_status");
		if(status == "incomplete") { //updates should onyl be done first time job is run.
			applicationGr.setValue("setup_status", "complete");
			applicationGr.update(); //update setup_status to "complete"

			var settingsGr = new GlideRecord("sys_cs_collab_settings");
			settingsGr.query();
			if(settingsGr.next()){
				settingsGr.setValue('enable_teams', true);
				settingsGr.setValue("enable_slack", false);
				settingsGr.setValue('preference_channel', 'a812eaf8c32111100f24c87af040dd59');
				settingsGr.update(); //toggle enable_teams in sys_cs_collab_settings;
			} else {throw "Missing sys_cs_collab_settings record";}

			gs.eventQueue('sidebar.teams.setup.complete', null, gs.getUser().getEmail(), "");
		}
	} else {throw "Missing sys_cs_collab_provider_application record";}

} catch(error) {
	applicationGr = new GlideRecord('sys_cs_collab_provider_application');
	applicationGr.addQuery('provider', "4bf5b90ac31211103f4fcd7b7940dd5e");
	applicationGr.query();
	if(applicationGr.next()){
		applicationGr.setValue("setup_status", "error");
		applicationGr.update(); //update setup_status to "error"
	}

	gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
}
