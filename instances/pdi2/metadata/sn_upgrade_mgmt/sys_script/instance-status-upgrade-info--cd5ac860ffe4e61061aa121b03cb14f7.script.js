(function executeRule(current, previous /*null when async*/) {

	var scheduled_date = current.upgrade_scheduled_on;
	var scheduledMessage = "Not Scheduled";
	if(scheduled_date != ""){
		var gdt = new GlideDateTime(scheduled_date);
		var date = gdt.getDisplayValue();
		scheduledMessage = "Scheduled on " + date;
	}
	var instanceId = gs.getProperty('instance_id');
	
	var instanceGR = new GlideRecord('sn_um_instance_status');
	instanceGR.addQuery('instance_id', instanceId);
	instanceGR.query();
	if (instanceGR.next()) {
		gs.info("Setting Upgrade_Status to : " + scheduledMessage);
		instanceGR.setValue('upgrade_status', scheduledMessage);
		instanceGR.update();
	}

})(current, previous);
