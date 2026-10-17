updateUseSnmpVersion();   
	
	function updateUseSnmpVersion() {
		var dictionaryGr = new GlideRecord('sys_dictionary');
		dictionaryGr.addQuery('name', 'discovery_schedule');
		dictionaryGr.addQuery('element', 'use_snmp_version');
		dictionaryGr.addQuery('default_value', '!=', 'all');
		dictionaryGr.query();
		
		if (dictionaryGr.next()) {
			dictionaryGr.setValue('default_value', 'all');
			dictionaryGr.update();
		}
		gs.info("Updated use_snmp_version on discovery_schedule to all");
	}
