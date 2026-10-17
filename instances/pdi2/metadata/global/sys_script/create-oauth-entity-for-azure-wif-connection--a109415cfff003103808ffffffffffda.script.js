(function executeRule(current, previous /*undefined when async or display*/) {
	var connectionName = current.getValue('connection_name');
	try {
		new WIFConnectionHelper().setupAzure(current);
	} catch (e) {
		gs.addErrorMessage(gs.getMessage(
			'Azure workload identity federation setup failed for "{0}": {1}',
			[connectionName, e.message]
		));
		gs.error('Workload identity federation Azure setup failed for "' + connectionName + '": ' + e);
		current.setAbortAction(true);
	}
})(current, typeof previous != 'undefined' ? previous : null);
