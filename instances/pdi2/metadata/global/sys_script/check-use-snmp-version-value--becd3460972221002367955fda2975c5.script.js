checkSNMPVersion();

function checkSNMPVersion() {
	var type = null;
	var snmp_version = current.use_snmp_version;
	if (snmp_version == 'v1_v2c')
		type = 'snmp';
	else if (snmp_version == 'v3')
		type = 'snmpv3';
	if (type) {
		var gr = new GlideRecord('discovery_credentials');
		gr.addQuery('type', type);
		gr.addActiveQuery();
		gr.setLimit(1);
		gr.query();

		if (!gr.hasNext()) {
			gs.addErrorMessage(gs.getMessage("No SNMP credentials of type '{0}' are active in this instance. Setting Use SNMP version back to All", type));
			current.use_snmp_version = 'all';
		}
	}
}
