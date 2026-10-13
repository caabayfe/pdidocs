var DiscoveryAWSRelationshipSensor;

(function() {

    DiscoveryAWSRelationshipSensor = { findAndCreateRelationToVM: findAndCreateRelationToVM};

    function findAndCreateRelationToVM(accountId, region, instanceId, ciSysId, eccQueueId) { 
		if (JSUtil.nil(accountId) || JSUtil.nil(region) || JSUtil.nil(instanceId) || 
			JSUtil.nil(ciSysId) || JSUtil.nil(eccQueueId))
				return null;

		var hostedOnRelationSysID, hostedOnRelationGR;	
		hostedOnRelationGR = new GlideRecord('cmdb_rel_type');
		if (hostedOnRelationGR.get('name', 'Hosted on::Hosts'))
			hostedOnRelationSysID = hostedOnRelationGR.getValue('sys_id');

		// If 'Hosted on::Hosts' Relation isn't found then no meaning of proceeding further
		if (!hostedOnRelationSysID) {
			DiscoveryLogger.warn("'Hosted on::Hosts' Relation Type is not found.", 'DiscoveryAWSRelationshipSensor', eccQueueId, null);
			return null;
		}

		// Looking for Service Account by Account ID and Account ID is unique in service acount table
		var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
		if (!serviceAccountGR.get('account_id', accountId)) {
			DiscoveryLogger.warn("No cloud service account found with account_id\t:\t'" + accountId + "' is found.'", 'DiscoveryAWSRelationshipSensor', eccQueueId, null);
			return null;
		}
		
		// We do one query to LDC table and in memory we cache all the LDCs Sys IDs whose object_id = region
		// Output would be list of LDCs sys ids with same object_id and they're associated to various service accounts i.e., always 1:1
		var ldcs = getListOfSysIDs('cmdb_ci_aws_datacenter', 'object_id', region);
		if (!ldcs.length) {
			DiscoveryLogger.warn("No aws ldcs found whose object_id\t:\t'" + region + "' are found.", 'DiscoveryAWSRelationshipSensor', eccQueueId, null);
			return null;
		}

		// We make one query to cmdb_rel_ci table by passing all LDCs Sys IDs (Child), Service Account Sys ID (Parent) and query limit i.e., setLimit to 1
		// This way though we have passed array of LDCs Sys ID, a Service Account can have hosted on relationship with one LDC but not all so we find right record
		var ldcSysID = findExactParentSysID(serviceAccountGR.getValue('sys_id'), ldcs, hostedOnRelationSysID);
		if (!ldcSysID) {
			DiscoveryLogger.warn("Cloud service account with object_id\t:\t'" + accountId + "'' does not contain any ldc with object_id\t:\t'" + region + "'.", 'DiscoveryAWSRelationshipSensor', eccQueueId, null);
			return null;
		}
		
		// We do one query to VM Instance table and in memory we cache all the VMs Sys IDs whose object_id = instanceId
		// Output would be list of VMs sys ids with same object_id
		var vms = getListOfSysIDs('cmdb_ci_vm_instance', 'object_id', instanceId);
		if (!vms.length) {
			DiscoveryLogger.warn("No vms found with object_id\t:\t'" + instanceId + "' are found.", 'DiscoveryAWSRelationshipSensor', eccQueueId, null);
			return null;
		}
		
		// We make one query to cmdb_rel_ci table by passing all VMs Sys IDs (Child), LDC Sys ID (Parent) and query limit i.e., setLimit to 1
		// This way though we have passed array of VMs Sys ID, a LDC can have hosted on relationship with one VM but not more than 1 VMs that 
		// has same object_id so we find right record
		var vmSysId = findExactParentSysID(ldcSysID, vms, hostedOnRelationSysID);
		if (!vmSysId) {
			DiscoveryLogger.warn("VM with object_id\t:\t'" + instanceId + "'' does not have association with any ldc whose object_id\t:\t'" + region + "'.", 'DiscoveryAWSRelationshipSensor', eccQueueId, null);
			return null;
		}
		
		var vmGlideRecord = new GlideRecord('cmdb_ci_vm_instance');
		if (vmGlideRecord.get('sys_id', vmSysId)) {

			var relGR = new GlideRecord("cmdb_rel_ci");
			relGR.addQuery('parent', ciSysId);
			relGR.addQuery("type", g_disco_functions.findCIRelationshipType("cmdb_rel_type", "Virtualized by::Virtualizes"));
			relGR.addQuery("child", '!=',vmSysId);
			relGR.query();
			relGR.deleteMultiple();
			
			g_disco_functions.createRelationshipIfNotExists(ciSysId, vmGlideRecord, "Virtualized by::Virtualizes");
		}

		else
			DiscoveryLogger.warn("Host hosted on cloud environment has been detected, but no matched cloud object found", 'DiscoveryAWSRelationshipSensor', eccQueueId, null);
		
		return vmGlideRecord;
	}
	
	function getListOfSysIDs(table, columnLabel, columnValue) {
		var sysIDsList = [];
		var tableGR = new GlideRecord(table);
		tableGR.addQuery(columnLabel, columnValue);
		tableGR.addNullQuery('duplicate_of');
		tableGR.query();
		while (tableGR.next()) 
			sysIDsList.push(tableGR.getValue('sys_id'));
		
		return sysIDsList;
	}
    
	function findExactParentSysID(childSysID, parentSysIDsList, hostedOnRelSysID) {
		var relationsGlideRecord = new GlideRecord('cmdb_rel_ci');
		relationsGlideRecord.addQuery('type', hostedOnRelSysID);
		relationsGlideRecord.addQuery('child', childSysID);
		relationsGlideRecord.addQuery('parent', 'IN', parentSysIDsList);
		relationsGlideRecord.setLimit(2);
		relationsGlideRecord.query();
		
		// If we've the VM record either in cmdb_ci_vm_instance or cmdb_ci_ec2_instance table then we return respective parent sys_id
		if (relationsGlideRecord.getRowCount() == 1 && relationsGlideRecord.next())
			return relationsGlideRecord.getValue('parent');
		else {
			// While loop takes care if the records are 2 existing in cmdb_ci_vm_instance and cmdb_ci_ec2_instance table with same
			// object_id that we look for then our preference always go for the record in cmdb_ci_vm_instance table rather than the other
			while (relationsGlideRecord.next()) {
				if (relationsGlideRecord.parent.sys_class_name == 'cmdb_ci_vm_instance')
					return relationsGlideRecord.getValue('parent');
			}
		}
	}
})();
