(function () {
	// get correlation_id from the guest's serial_number
	var matchingId = current.serial_number.substring(7);
	
	// find any vm_instances where correlation_id matches this guest's serial_number
	// mark it to be reconciled
	var gr = new GlideRecord('cmdb_ci_vmware_instance');
	gr.addQuery('correlation_id', matchingId);
	gr.query();
	while (gr.next()) {
		gr.guest_reconciled = false;
		gr.update();
	}

})();
