(function executeRule(current, previous /*null when async*/) {

	var slaClasses = new GlideRecord("cmdb_contract_product_model");
	slaClasses.addQuery("attach_sla", true);
	slaClasses.query();
	var sysIds = [];
	
	while (slaClasses.next())
		sysIds.push(slaClasses.getUniqueValue());
	
	g_scratchpad.attach_sla_class_ids = sysIds;

})(current, previous);
