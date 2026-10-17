// Performs 2 functions:
//   1. When inserting records, change the default value of requires_enrollment, if the verification is auto-enroll
//   2. Enforce that at least one of the process verifications must have auto_enroll=true OR requires_enrollment=true
//      We handle this by showing a message and deactivating the process (if active)
(function executeRule(current, previous /*null when async*/) {
	
	// Override default value if the verification type has auto enroll
	// This is done in biz rule because current is null when using a dynamic default value with M2M
	if (current.operation() == 'insert' && hasAutoEnroll(current)) {
		current.requires_enrollment = false;
		return;
	}
	
	// Don't need to check other records when updating if the updated value is valid 
	if (current.operation() == 'update' && (current.getValue('requires_enrollment') == true || hasAutoEnroll(current)))
		return;
	
	var mapGr = new GlideRecord(current.sys_class_name);
	mapGr.addQuery('process', current.process);
	mapGr.addQuery('requires_enrollment', true).addOrCondition('verification.type.auto_enroll', true);
	mapGr.addQuery('sys_id', '<>', current.sys_id);
	mapGr.query();
	
	if (!mapGr.next()) {
		gs.addInfoMessage(gs.getMessage('Process must be mapped to at least one verification which requires enrollment or has auto-enrollment'));
		var procGr = new GlideRecord("pwd_process");
		if (procGr.get(current.process) && procGr.getValue("active") == true) {
			procGr.setValue("active", false);
			procGr.update();
			gs.addInfoMessage(gs.getMessage('Process deactivated: {0}', procGr.getValue('name')));
		}
	}	
})(current, previous);

function hasAutoEnroll(current) {
	return current.verification.type.auto_enroll + '' == 'true';
}
