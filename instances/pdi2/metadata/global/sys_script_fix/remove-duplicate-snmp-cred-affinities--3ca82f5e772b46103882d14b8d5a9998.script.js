removeDuplicateSnmpCredAffinities();

function removeDuplicateSnmpCredAffinities() {
	var batchSize = 100;
	var currentIP = "";
	var previousIP = "";
	var affinityObject = {};
	var affinityObjectList = [];
	var affinitiesToRemove = [];
	var affinityGr = new GlideRecord('dscy_credentials_affinity');
	affinityGr.addQuery('type', 'snmp');
	affinityGr.orderBy('ip_address');
	affinityGr.orderByDesc('sys_updated_on');
	affinityGr.query();

	while (affinityGr.next()) {
		currentIP = affinityGr.getValue('ip_address');
		affinityObject = {};  
		affinityObject.domain = affinityGr.getValue('sys_domain'); 
		affinityObject.mid = affinityGr.getValue('agent');
		affinityObject.credId = affinityGr.getValue('credential_id');
		
		// If we find new IP, start over with new IP and reset values in arrays
		if (currentIP != previousIP) {
			previousIP = currentIP;
			affinityObjectList = [];
			affinityObjectList.push(affinityObject);
			continue;
		}

		// Else, we are still on same IP, so check to see if we have value already that matches
		// on MID, Credential ID, and Domain. If we don't, then add to array and check next record
		var foundMatch = affinityObjectList.some(function(arrayObj) {
			if (arrayObj.domain == affinityObject.domain && arrayObj.mid == affinityObject.mid && 
			arrayObj.credId == affinityObject.credId)
				return true;
		});

		if (!foundMatch) {
			affinityObjectList.push(affinityObject);
			continue;
		}

		// If we reach here, then we have a duplicate, so we can remove this affinity record
		affinitiesToRemove.push(affinityGr.getValue('sys_id'));
		// Remove duplicate records in batches
		if (affinitiesToRemove.length >= batchSize) {
			batchDeleteAffinityRecords(affinitiesToRemove);
			affinitiesToRemove = [];
		}
	}
	// Remove any remaining records
	batchDeleteAffinityRecords(affinitiesToRemove);
}

function batchDeleteAffinityRecords(list) {
	if (list.length > 0) {
		var affinityTable = new GlideMultipleDelete('dscy_credentials_affinity');
		affinityTable.addQuery('sys_id', 'IN', list);
		affinityTable.execute();
		gs.debug("Deleted batch of " + affinityTable.getUpdateCount() + " duplicate SNMP Credential Affinity records");
	}
}
