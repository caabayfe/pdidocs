var DiscoveryAzureRelationshipSensor;

(function(){
	
	DiscoveryAzureRelationshipSensor = { findAndCreateRelationToVM: findAndCreateRelationToVM};
	
	function findAndCreateRelationToVM(vmInstance, ciSysId, eccQueueId) {
	
		var vmGlideRecord = null;
		
		if (JSUtil.nil(vmInstance) || JSUtil.nil(ciSysId) || JSUtil.nil(eccQueueId))
			return null;

		vmGlideRecord = new GlideRecord('cmdb_ci_vm_instance');
		vmGlideRecord.addQuery('install_status', 'NOT IN', [7, 100]); //pick active VMs only. 7 - Retired, 100 - Absent
		vmGlideRecord.addQuery('vm_inst_id', vmInstance);
		vmGlideRecord.query();

		if (vmGlideRecord.next()) {

			var relGR = new GlideRecord("cmdb_rel_ci");
			relGR.addQuery('parent', ciSysId);
			relGR.addQuery("type", g_disco_functions.findCIRelationshipType("cmdb_rel_type", "Virtualized by::Virtualizes"));
			relGR.addQuery("child", '!=',vmGlideRecord.getUniqueValue());
			relGR.query();
			relGR.deleteMultiple();
			
			g_disco_functions.createRelationshipIfNotExists(ciSysId, vmGlideRecord, "Virtualized by::Virtualizes");
		}

		else
			DiscoveryLogger.warn("Host hosted on cloud environment has been detected, but no matched cloud object found", 'DiscoveryAzureRelationshipSensor', eccQueueId, null);
		
		return vmGlideRecord;
	}
	
})();
