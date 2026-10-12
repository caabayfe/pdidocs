(function executeRule(current, previous /*undefined when async or display*/) {
	try {
		new WIFConnectionHelper().validateGcpConnection(current);
	} catch (e) {
		gs.addErrorMessage(gs.getMessage(e.message));
		current.setAbortAction(true);
		return;
	}

	var connectionName = current.getValue('connection_name');
	var existing = new GlideRecord('workload_identity_connection_gcp');
	existing.addQuery('connection_name', connectionName);
	existing.setLimit(1);
	existing.query();
	if (existing.next()) {
		gs.addErrorMessage(gs.getMessage(
			'A GCP workload identity connection with name "{0}" already exists.',
			connectionName
		));
		current.setAbortAction(true);
	}
})(current, typeof previous != 'undefined' ? previous : null);
