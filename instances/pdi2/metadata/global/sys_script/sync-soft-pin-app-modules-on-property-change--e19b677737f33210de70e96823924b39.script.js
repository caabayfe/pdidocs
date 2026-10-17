(function executeRule(current, previous /*null when async*/) {

	var SEPARATOR_MODULE_SYSID = 'a45bca09ff0032108a03ffffffffff6e';
	var ENROLL_MODULE_SYSID = 'fdfcc649ff0032108a03ffffffffffac';
	var enabling = current.getValue('value') == 'true';

	var moduleIds = [SEPARATOR_MODULE_SYSID, ENROLL_MODULE_SYSID];
	for (var i = 0; i < moduleIds.length; i++) {
		var gr = new GlideRecord('sys_app_module');
		if (gr.get(moduleIds[i])) {
			gr.setValue('active', enabling);
			gr.update();
		}
	}

})(current, previous);
