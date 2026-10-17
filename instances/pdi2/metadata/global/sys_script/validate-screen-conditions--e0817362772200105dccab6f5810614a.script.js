(function executeRule(current, previous /*null when async*/) {

	var isInsert = current.operation() == 'insert';

	// check for duplicate record first in the sys_ux_screen table for inserts
	if (isInsert) {
		var screenGR = GlideRecord('sys_ux_screen');
		screenGR.addQuery('screen_condition', current.screen_condition);
		screenGR.addQuery('screen_type',current.screen_type);
		screenGR.addQuery('app_config', current.app_config);
		screenGR.addQuery('macroponent', current.macroponent);
		screenGR.addQuery('order', current.order);
		screenGR.addQuery('active', current.active);
		screenGR.addQuery('sys_domain', current.sys_domain);
		screenGR.query();
		if (screenGR.hasNext()){
			gs.addErrorMessage(gs.getMessage("Duplicate Record Found"));
			current.setAbortAction(true);
			return;
		}
	}

	if (current.parent_macroponent == current.macroponent) {
		gs.addErrorMessage(gs.getMessage("A screen cannot be a child of the same macroponent that is used as it's page definition."));
		current.setAbortAction(true);
		return;
	}

	if (!current.screen_condition)
		return;
	var encodedQuery = current.screen_condition;
	var conditions = encodedQuery.split(/\^OR|\^/);
	var alphaNumRegex = /^[0-9a-zA-Z_.-]+$/;
	for(i=0; i<conditions.length; i++){
		pair = conditions[i].split(/!=|=|STARTSWITH/);
		if (!pair[0].match(alphaNumRegex) || !pair[1].match(alphaNumRegex)){
			gs.addErrorMessage(gs.getMessage("Invalid syntax in screen condition: {0}",conditions[i]));
			current.setAbortAction(true);
			return;
		}
	}
})(current, previous);
