(function executeRule(current, previous /*null when async*/) {
	/*
		This script will traverse macroponents referenced in the extends field and attempt to prevent a circular dependency from occuring.
		There is a max depth limit of 10 before the current action is aborted due to too deep of nesting. 
	*/

	var maxRecursionDepth = 10;
	var EXTENDS = 'extends';

	if (current[EXTENDS] == '') {
		return;
	}

	function getMacroponent(sysId) {
		var gr = new GlideRecord('sys_ux_macroponent');

		if (gr.get(sysId)) {
			return {
				sysId: gr.getUniqueValue(),
				extendsSysId: gr.getValue(EXTENDS),
				name: gr.getValue('name')
			};
		}
	}

	function logAndAbort(sysId, name) {
		gs.addErrorMessage(gs.getMessage(
			"Circular dependency detected on the extends field with the following macroponent. Please address before updating record <br><br>" +
			"'{0}' (sys_id: '{1}') extends '{2}'", [name, sysId, current['name']]
		));
		current.setAbortAction(true);
	}

	// Recursive loop that will iterate through the extends field of each macroponent trying to find a 
	// circular dependency. Depth limit of 10 
	function checkExtendsCircularDependency(extendedMacroponentSysId, currentLevel) {
		if (extendedMacroponentSysId === null) {
			return;
		}

		var macroponent = getMacroponent(extendedMacroponentSysId);

		if (macroponent.extendsSysId && macroponent.extendsSysId.toString() === current.sys_id.toString()) {
			logAndAbort(macroponent.sysId, macroponent.name);
		}

		if (currentLevel == maxRecursionDepth) {
			gs.addErrorMessage(gs.getMessage("Maximum dependency level reached on 'extends' field. <br><br>" +
			"Last checked macroponent: '{0}' (sys_id: '{1}')<br><br>" + 
			"Please keep 'sys_ux_macroponent.extends' dependency tree at or below {2}",
			[macroponent.name, macroponent.sysId, maxRecursionDepth]));
			current.setAbortAction(true);
			return;
		}

		checkExtendsCircularDependency(macroponent.extendsSysId, ++currentLevel);
	}

	if (current[EXTENDS] && current[EXTENDS].toString() === current.sys_id.toString()) {
		gs.addErrorMessage(gs.getMessage("A macroponent cannot extend itself. Please address before updating record"));
		current.setAbortAction(true);
	}  else {
		checkExtendsCircularDependency(current[EXTENDS], 1);
	}
})(current, previous);
