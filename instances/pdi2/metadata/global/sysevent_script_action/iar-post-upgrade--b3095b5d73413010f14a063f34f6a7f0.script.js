var incidentBrSysId = gs.getProperty('com.glide.cs.auto_resolution_incident_br');
if (!gs.nil(incidentBrSysId)) {
	gs.info('Executing script action after system.upgraded event - IAR incident business rule[Auto-Resolution Trigger for incident] was set to inactive pre-upgrade to support ZDT, re-setting it to active.');
		
	var brGr = new GlideRecord('sys_script');
	brGr.get(incidentBrSysId);
	
	brGr.setValue('active', true);
	brGr.update();
}
