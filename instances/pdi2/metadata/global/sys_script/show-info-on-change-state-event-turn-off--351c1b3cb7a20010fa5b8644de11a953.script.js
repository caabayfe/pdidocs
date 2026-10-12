(function executeRule(current, previous /*null when async*/ ) {

	var impactedEventHandlerList = [];
	var scriptActionGr = new GlideRecord('sysevent_script_action');
	scriptActionGr.addQuery('event_name', 'sn_change.state.updated');
	scriptActionGr.addActiveQuery();
	scriptActionGr.query();
	while (scriptActionGr.next()) 
		impactedEventHandlerList.push('' + scriptActionGr.name);

	if (impactedEventHandlerList.length > 0) 
		gs.addInfoMessage(gs.getMessage('The generate \'sn_change.state.updated\' event property is disabled. This impacts the following script action(s): {0}', impactedEventHandlerList.join(', ')));

})(current, previous);
