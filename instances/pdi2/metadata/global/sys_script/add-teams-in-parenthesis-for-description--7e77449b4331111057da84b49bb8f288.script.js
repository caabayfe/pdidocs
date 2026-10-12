(function executeRule(current, previous /*null when async*/) {
	var hasTeamsCondition = TargetLocationHelper.hasChannelCondition(current, 'teams');
	var deviceTypeCount = amountOfDevicetypeConditions(current);
	var parenthesisValue = gs.getMessage('(Teams)');
	
	if(hasTeamsCondition && deviceTypeCount == 1 && !current.description.includes(parenthesisValue)){
		current.setValue('description', current.getValue('description') + ' ' + parenthesisValue);
	} 
	else if(current.description.includes(parenthesisValue) && (!hasTeamsCondition || deviceTypeCount > 1)){
		current.setValue('description', current.description.replace(' '+parenthesisValue, ''));
	}
	
})(current, previous);

function amountOfDevicetypeConditions(current){
	if(current.condition != '')
		return current.condition.toLowerCase().split('u_liveagent_devicetype').length - 1;
	
	return 0;
}
