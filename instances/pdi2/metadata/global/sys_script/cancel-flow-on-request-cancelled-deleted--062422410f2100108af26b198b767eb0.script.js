(function executeRule(current, previous /*null when async*/) {
	// If request has a flow desinger execution associated with it, cancel it.
	if ((current.stage == 'Request Cancelled' || current.operation() == 'delete') && current.flow_context && !current.flow_context.nil())
		new sn_fd.FlowAPI.cancel(current.flow_context, "manually by " + gs.getSession().getUserName());
	
})(current, previous);
