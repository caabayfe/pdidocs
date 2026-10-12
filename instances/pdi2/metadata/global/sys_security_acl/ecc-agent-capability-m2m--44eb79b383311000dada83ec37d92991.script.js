answer = verifyCapability();

function verifyCapability() {
	var capGr = new GlideRecord('ecc_agent_capability');
	capGr.addQuery('capability', 'Nmap');
	capGr.query();
	if (!capGr.next())
		return true;
	
	if (current.capability == capGr.getValue('sys_id'))
		return gs.hasRole('maint');
	
	return true; 
}
