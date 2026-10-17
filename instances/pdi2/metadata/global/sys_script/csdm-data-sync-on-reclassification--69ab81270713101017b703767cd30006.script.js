(function executeRule(current, previous /*null when async*/) {
	var mbg;
	var cmdbClassInfo = new GlideRecord("cmdb_class_info");
	cmdbClassInfo.addQuery("class", current.sys_class_name);
	cmdbClassInfo.query();
	
	if (cmdbClassInfo.next() && cmdbClassInfo.managed_by_group) {
		mbg = cmdbClassInfo.managed_by_group;
	} else {
		mbg = 'NULL';
	}

	// check for TSO associations
	var util = new CSDMCMDBUtil();
	var dcgs = util.getCisMappedToDCG([current.sys_id]);
	if (Object.keys(dcgs).length > 0) {
		var sos = util.getAssocTSOsFromDCG(Object.keys(dcgs));
		if (Object.keys(sos).length > 0) {
			var grTso = util.getTSOs(Object.keys(sos));
			while (grTso.next()) {
				if (grTso.managed_by_group) {
					return;
				}
			}
		}
	}
	
	// if we've gotten here, there are no tsos associated with the CI, or they do not have mbg applied
	current.setValue("managed_by_group", mbg);
	current.update();

})(current, previous);
