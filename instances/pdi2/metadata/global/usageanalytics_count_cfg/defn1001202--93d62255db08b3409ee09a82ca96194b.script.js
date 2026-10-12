answer = JSON.stringify(constructNmapCapabilityJSON());

function constructNmapCapabilityJSON() {
	var result = {};
	
	if (!GlideTableDescriptor.isValid('ecc_agent'))
		return result;
		
	if (!GlideTableDescriptor.isValid('ecc_agent_capability'))
		return result;
	
	if (!GlideTableDescriptor.isValid('ecc_agent_capability_m2m'))
		return result;
	
	var NAME = 'name';
	var VALUE = 'value';
	var AGENT = 'agent';
	var CAPABILITY = 'capability';
	var NMAP_CAPABLE = 'nmap_capable';
	
	var capabilityGr = new GlideRecord('ecc_agent_capability');
	capabilityGr.addQuery(CAPABILITY, 'nmap');
	capabilityGr.query();
	var nmapCapExists = capabilityGr.next();
	var nmapCapSysId;
	if (nmapCapExists)
		nmapCapSysId = capabilityGr.getUniqueValue();
	
	var total_count = 0;
	var nmap_capable_count = 0;
	var arrayOfMappings = [];
	
	var agentGr = new GlideRecord('ecc_agent');
	agentGr.query();
	while (agentGr.next()) {
		var mapping = {};
		mapping[NAME] = agentGr.getValue(NAME);
		if (nmapCapExists) {
			var midSysId = agentGr.getUniqueValue();
		
			var capabilitym2mGr = new GlideRecord('ecc_agent_capability_m2m');
			capabilitym2mGr.addQuery(AGENT, midSysId);
			capabilitym2mGr.addQuery(CAPABILITY, nmapCapSysId);
			capabilitym2mGr.query();
		
			var nmap_capable;
			if (capabilitym2mGr.getRowCount() > 0) {
				nmap_capable_count++;
				nmap_capable = 'true';
			} else
				nmap_capable = 'false';
				
			mapping[NMAP_CAPABLE] = nmap_capable;
		} else
			mapping[NMAP_CAPABLE] = 'N/A';
		
		arrayOfMappings.push(mapping);
		total_count++;
	}
	
	result['mid_config'] = arrayOfMappings;
	result['nmap_capable_count'] = nmap_capable_count;
	result['count'] = total_count;
	
	return result;
}
