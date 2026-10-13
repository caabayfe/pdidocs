var SNMPFillCredentialsIds = Class.create();
SNMPFillCredentialsIds.prototype = {
    initialize: function() {
    },

	getCredentialsIds : function(snmpExtSysId) {
		var snmpCredentialsGr = new GlideRecord('em_snmp_to_credentials');
		snmpCredentialsGr.addQuery('snmp', snmpExtSysId);
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

		return result;
	},
	
    type: 'SNMPFillCredentialsIds'
};
