(function executeRule(current, previous /*null when async*/) {

	var onCallCommunicationTypeGr = new GlideRecord('on_call_communication_type');
	onCallCommunicationTypeGr.addQuery('type', current.getValue('type'));
	if (current.operation() == 'update')
		onCallCommunicationTypeGr.addQuery('sys_id','!=', current.getUniqueValue());
	onCallCommunicationTypeGr.query();
	if (onCallCommunicationTypeGr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Selected Communication type already exists'));
		current.setAbortAction(true);
	}

})(current, previous);
