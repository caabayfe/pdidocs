(function executeRule(current, previous /*null when async*/ ) {

	var table = current.table + '';
	var commTaskGr = new GlideRecord(table);
	commTaskGr.get(current.source + '');
	var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(commTaskGr.comm_plan.source.getRefRecord().getRecordClassName());
	var utilObject = new sn_comm_management.CommunicationManagementUtil();
	var channelActionMap = {};

	if (previous.active && !current.active && current.operation() != 'insert') {
		if (commTaskGr.communication_frequency == 'recurring')
		    commTaskGr.state = 1;
		channelActionMap = {
			'conference': {
				action: 'completed'
			}
		};
		utilObject.updateChannelState(channelActionMap, handlerInstance, commTaskGr);
	}

	if (!previous.active && current.active) {
		commTaskGr.state = 2;
		commTaskGr.comments = gs.getMessage("Conference call {0} started at: {1} {2}", [current.number, current.sys_created_on.getDisplayValue(), gs.getUser().getTZ()]);
		commTaskGr.update();
		channelActionMap = {
			conference: {
				action: 'started',
				notify_conference_call_sys_id: current.sys_id + ''
			}
		};
		utilObject.updateChannelState(channelActionMap, handlerInstance, commTaskGr);
	}
})(current, previous);
