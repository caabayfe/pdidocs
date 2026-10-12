var scanFailureReasonDictGR = new GlideRecord('sys_dictionary');
scanFailureReasonDictGR.addQuery('name', 'sys_app_scan_failure');
scanFailureReasonDictGR.addQuery('element', 'reason');
scanFailureReasonDictGR.query();

if (scanFailureReasonDictGR.next()) {
	
	//Add no_truncate attribute
	var attributes = scanFailureReasonDictGR.getValue('attributes');
	if (gs.nil(attributes)) {
		gs.info("Adding no_truncate attribute to sys_app_scan_failure.reason");
		scanFailureReasonDictGR.setValue('attributes', 'no_truncate=true');
	} else if (attributes.indexOf('no_truncate') < 0) {
		gs.info("Adding no_truncate attribute to sys_app_scan_failure.reason");
		scanFailureReasonDictGR.setValue('attributes', attributes + ',no_truncate=true');
	}
	
	//Set "Reason" column label to "Error"
	scanFailureReasonDictGR.setValue('column_label', 'Error');
	gs.info("Changing sys_app_scan_failure.reason column label to 'Error'");
	
	if (scanFailureReasonDictGR.update()) {
		gs.info("Updated sys_app_scan_failure.reason dictionary record");
	} else {
		gs.error("Failed to update sys_app_scan_failure.reason dictionary record");
	}
}
