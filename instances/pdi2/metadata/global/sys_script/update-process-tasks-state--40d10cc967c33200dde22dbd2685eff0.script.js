(function executeRule(current, previous /*null when async*/) {

	//if process status wasn't changed or if the new status is not approved or rejected, return.
	if(previous.process_status == current.process_status || (current.process_status != 4 && current.process_status != 5 ))
		return;
	
	var gr = new GlideRecord('service_process_task');
	gr.addQuery('business_service', current.sys_id);
	gr.addQuery('assigned_to', gs.getUserID());
	gr.addQuery('type', 1);
	gr.query();
	while(gr.next()){
		
	   gr.state=3;
	   gr.update();
	}

	if (current.process_status == 5) {
		var dmm = new SNC.DiscoveryMessageManager();
		dmm.resolveRejectedServiceMessage(current.sys_id);
	}
})(current, previous);
