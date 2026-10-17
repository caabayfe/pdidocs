(function executeRule(current, previous /*null when async*/) {
	var sysProperties = new GlideRecord('sys_properties');
	sysProperties.addQuery('name', 'glide.ecc.enable_multidomain_mid');
	sysProperties.query();
	var propWasDeleted = !sysProperties.next();
	
	var midProperties = new GlideRecord('ecc_agent_property');
	midProperties.addQuery('name', 'mid.enable_multidomain_mid');
	midProperties.query();
	midProperties.next();
	
	// delete or update the mid server property
	if (propWasDeleted) {
		midProperties.deleteRecord();
	} else {
		midProperties.name = 'mid.enable_multidomain_mid';
		midProperties.value = sysProperties.value;
		midProperties.update();
	}
})(current, previous);
