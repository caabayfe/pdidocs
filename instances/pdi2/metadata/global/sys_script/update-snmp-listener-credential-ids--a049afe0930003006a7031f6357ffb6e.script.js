(function executeRule(current, previous /*null when async*/) {
	var snmpCredentialsGr = new GlideRecord('em_snmp_to_credentials');
	snmpCredentialsGr.addQuery('snmp', current.snmp);
	snmpCredentialsGr.query();			

	var result = "";
	var rowCount = snmpCredentialsGr.getRowCount();
	var count = 1;
	while (snmpCredentialsGr.next()){
		result = result + snmpCredentialsGr.credentials;
		if(count < rowCount)
			result = result + ",";
		count ++;
	}
	
	var snmpListenrGr = new GlideRecord('ecc_agent_ext_context_trap');
	if(snmpListenrGr.get(current.snmp)) {
		snmpListenrGr.setValue("credential_ids", result);
		snmpListenrGr.update();
	}

})(current, previous);
