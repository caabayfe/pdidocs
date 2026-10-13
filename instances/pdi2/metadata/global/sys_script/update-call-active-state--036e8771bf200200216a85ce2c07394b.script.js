function onBefore(current, previous) {
	var status = current.status;
	var endStatuses = ['completed', 'no_answer', 'busy', 'failed'];
	var arrayUtil = new ArrayUtil();
	var isEndStatus = arrayUtil.contains(endStatuses, status);
	var activeState = !isEndStatus;

	// should the active state change?
	if (current.notify_call.active != activeState) {
		updateActiveStateForCall(current, activeState);
	}
}

function updateActiveStateForCall(current, active) {
	// change the call active state
	var call = new GlideRecord('notify_call');
	if (call.get(current.notify_call)) {
		call.setValue('active', active);
		call.update();
		if (!active) {
			gs.eventQueue('notify_call.end', call);
			if(call.sys_flow_context) 
				sn_fd.FlowAPI.cancel(call.sys_flow_context, "Associated call ended"); 
		}
	}
	
}
