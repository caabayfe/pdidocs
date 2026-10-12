(function executeRule(current, previous /*null when async*/) {
	if (current.business_rule != previous.business_rule) 
		setOldTargetBRInactive(previous);
	
	var brGr = new GlideRecord('sys_script');	
	var brName = 'Auto-Resolution Trigger for ' + current.target_table_name;	
	var brSysId = checkIfTargetBRExists(current, brName);
	
	if (gs.nil(brSysId) && gs.nil(current.business_rule) && current.getValue('iar_invocation') == "business_rule") {
		//create a BR for the target_table
		brGr.setValue('name', brName);
		brGr.setValue('collection', current.target_table_name);
		var script = '(function executeRule(current, previous) /*null when async*/ {\n';
		script += '\tvar taskHelper = new global.AutoResolutionTaskHelper();\n';
		script += '\ttaskHelper.processTask(current);\n';
		script += '})(current, previous);';
		brGr.setValue('script', script);
		brGr.setValue('active', current.active);
		brGr.setValue('action_insert', true);
		brGr.setValue('advanced', true);
		brGr.setValue('when', 'before');
		brGr.setValue('filter_condition', current.condition);
		brGr.setValue('order', 99999); // set order to higher number so IAR can override any other assignments
		var newBrSysId = brGr.insert();
		
		current.business_rule = newBrSysId;
		current.update();
	}	
	else if (!gs.nil(brSysId)) {
		current.business_rule = brSysId;
		
		brGr.initialize();
		brGr.get(brSysId);
		if (current.condition != previous.condition)
			brGr.setValue('filter_condition', current.condition);
		
		// if the iar_invocation changes to API we need to de-activate the BR on target table
		if (String(current.iar_invocation) == "api") 
			brGr.setValue('active', false);
		else
			brGr.setValue('active', current.active);
		
		// we don't want to accidentally overwrite the order for existing BR's (if customers have already modified, need to respect that)
		if (Number(brGr.getValue("order")) === 100)
			brGr.setValue('order', 99999);
	
		brGr.update();
		current.update();
	}
	
	function setOldTargetBRInactive(previous) {
		var brGr = new GlideRecord('sys_script');
		brGr.get(previous.business_rule);
		brGr.setValue('active', false);
		brGr.update();
	}
	
	function checkIfTargetBRExists(current, name) {
		var brGr = new GlideRecord('sys_script');
		brGr.addQuery('name', name);
		brGr.addQuery('collection', current.target_table_name);
		brGr.query();
		
		if (brGr.next())
			return brGr.getUniqueValue();
		else 
			return null;
	}
	

})(current, previous);
