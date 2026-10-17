(function executeRule(current, previous /*null when async*/) {

	var chgNumber = current.getValue('chg');
	var scriptName = current.getValue('name') || current.getUniqueValue();
	var order = current.getValue('order');
	var reason = 'Not executed: a script in order group ' + order + ' failed (name=' + scriptName + ')';
	new sn_instance_clone.CloneCleanupScriptScheduler(chgNumber).markRemainingNotExecuted(order, reason);

})(current, previous);
