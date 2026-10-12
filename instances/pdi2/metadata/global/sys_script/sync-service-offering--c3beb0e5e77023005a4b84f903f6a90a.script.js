(function executeRule(current, previous /*null when async*/ ) {
	var newOffering = current.service_offering;
	var oldOffering = previous.service_offering;

	if (!oldOffering.nil())
		removePreviousOffering(oldOffering);

	if (!newOffering.nil())
		addCurrentOffering(newOffering);

	function removePreviousOffering(offeringRecord) {
		// Delete impacted service records for this task and previous business service/offering
		var gr = new GlideRecord('task_service_offering');
		gr.addQuery('task', current.sys_id);
		gr.addQuery('service_offering', offeringRecord);
		gr.deleteMultiple();
	}

	function addCurrentOffering(offeringRecord) {
		//Create impacted service record for this task and current business service/offering
		var gr = new GlideRecord('task_service_offering');
		gr.addQuery('task', current.sys_id);
		gr.addQuery('service_offering', offeringRecord);
		gr.query();
		if (gr.next())
			return;

		var svOfGr = new GlideRecord('service_offering');
		if (svOfGr.get(offeringRecord)) {
			gr.initialize();
			gr.task = current.sys_id;
			gr.service_offering = offeringRecord;
			gr.insert();			
		}
	}
})(current, previous);
