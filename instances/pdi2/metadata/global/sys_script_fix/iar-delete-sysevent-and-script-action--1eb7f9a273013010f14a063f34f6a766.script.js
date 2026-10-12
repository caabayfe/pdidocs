executeFix();

function executeFix() {
	
	gs.info('1. Executing IAR Delete sysevent and script action: Deleting sysevent register record');
	var sysEventRegGr = new GlideRecord('sysevent_register');
	sysEventRegGr.addQuery('event_name', 'task.assigned_to.virtual_agent');
	sysEventRegGr.query();
	
	if (sysEventRegGr.next()) {
		gs.info('Deleting sysevent register record: ' + sysEventRegGr.getValue('event_name'));
		sysEventRegGr.deleteRecord();
	}
	
	gs.info('2. Executing IAR Delete sysevent and script action: Deleting script action record for the associated IAR sysevent');
	var scriptActionGr = new GlideRecord('sysevent_script_action');
	scriptActionGr.addQuery('event_name', 'task.assigned_to.virtual_agent');
	scriptActionGr.query();
	
	if (scriptActionGr.next()) {
		gs.info('Deleting sysevent script action record: ' + scriptActionGr.getValue('event_name'));
		scriptActionGr.deleteRecord();
	}
}
