(function executeRule(current, previous /*null when async*/) {

	// First check the scan instance values. If the current and previous scan instance IDs are the different
	// we're going to imply that this update is part of a rescan and thus do nothing to the scan source.
	
	var currentScanInstance = current.getValue('scan_instance');
	var previousScanInstance = previous.getValue('scan_instance');
	
	if (currentScanInstance === previousScanInstance) {
	
		// So now we're assuming the user has clicked save on the form for the payload, so we're on to the next
		// check which is ensuring that the payload has been modified. Payload is the only field we're concerned
		// with at the present moment.

		var currentPayload = current.getValue('serialized_record');
		var previousPayload = previous.getValue('serialized_record');
		
		if (currentPayload !== previousPayload) {
			// The payload has been modified, therefore, we're going to interpret that as the user making a change
			// and thus we'll set the scan_source to manual.
			current.setValue('scan_source', 'manual');
		}
		
	}

})(current, previous);
