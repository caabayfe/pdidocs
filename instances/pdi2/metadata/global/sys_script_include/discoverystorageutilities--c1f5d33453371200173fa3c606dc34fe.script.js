var DiscoveryStorageUtilities;

(function () {
	
	DiscoveryStorageUtilities = {
		getAggregateDataSize: getAggregateDataSize,
		checkUseSmiDiscovery: checkUseSmiDiscovery,
		convertStorageServerReferenceToRel: convertStorageServerReferenceToRel,
		convertStorageServerReferenceIPToRel: convertStorageServerReferenceIPToRel,
		createSnapshotForDiscoveredNetAppStorage: createSnapshotForDiscoveredNetAppStorage,
		checkUseNetApp7modePattern: checkUseNetApp7modePattern,
		checkUseNetAppClusterModePattern: checkUseNetAppClusterModePattern,
		
		
	};
	
	var excludedTypes = {
		cd: 1,
		cdrom: 1,
		ram: 1,
		removable: 1
	};
	
	function getAggregateDataSize(deviceCi) {
		var i;
		var deviceCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		var totalBytes = 0;
		
		for (i = 0; i < deviceCis.length; ++i)
			if (!excludedTypes[deviceCis[i].data.drive_type])
			totalBytes += +(deviceCis[i].data.size_bytes || 0);
		
		return totalBytes;
	}
	
	function checkUseSmiDiscovery(discoveryData) {
		// We only support native discovery for NetApp
		if (discoveryData.className != 'ONTAP_StorageSystem')
			return true;
		
		var gr = new GlideRecord('sys_properties');
		if (discoveryData.Description.indexOf('7-Mode') > 0)
			gr.addQuery('name', 'glide.discovery.sensors.netapp_native_7mode');
		else
			gr.addQuery('name', 'glide.discovery.sensors.netapp_native_cluster_mode');
		
		gr.query();
		if (gr.next() && ('' + gr.value) == 'true')
			return false;
		
		return true;
	}
	
	function checkUseNetApp7modePattern() {
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', 'glide.discovery.sensors.netapp_native_7mode');
		gr.query();
		if (gr.next() && ('' + gr.value) == 'false')
			return false;
		
		return true;
	}
	
	function checkUseNetAppClusterModePattern() {
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', 'glide.discovery.sensors.netapp_native_cluster_mode');
		gr.query();
		if (gr.next() && ('' + gr.value) == 'false')
			return false;
		
		return true;
	}
	
	function convertStorageServerReferenceToRel(storageRecord, refCiTable, refField, relSysId, reverseRel) {
		if (!storageRecord || !refCiTable || !refField || !relSysId || !reverseRel)
			return;
		var storageServerSysId = storageRecord.getValue('sys_id');
		var gr = new GlideRecord(refCiTable);
		gr.addQuery(refField, storageServerSysId);
		gr.query();
		while (gr.next()) {
			if (reverseRel == 'false') {
				createNewRelCi(storageServerSysId, gr.getValue('sys_id'), relSysId);
			} else {
				createNewRelCi(gr.getValue('sys_id'), storageServerSysId, relSysId);
			}
		}
	}
	
	
	function convertStorageServerReferenceIPToRel(storageRecord, relSysId) {
		if (!storageRecord || !relSysId)
			return;
		var storageServerSysId = storageRecord.getValue('sys_id');
		var gr = new GlideRecord('cmdb_ci_ip_address');
		gr.addQuery('nic.cmdb_ci', storageServerSysId);
		gr.query();
		while (gr.next()) {
			var nicGr = new GlideRecord('cmdb_ci_network_adapter');
			var sysId = gr.getValue('nic');
			if (!sysId || !nicGr.get('sys_id', sysId))
				continue;
			
			createNewRelCi(storageServerSysId, gr.getValue('sys_id'), relSysId);
			createNewRelCi(storageServerSysId, nicGr.getValue('sys_id'), relSysId);
		}
	}
	
	function createNewRelCi(parent, child, relTypeSysId) {
		var gr = new GlideRecord('cmdb_rel_ci');
		gr.addQuery('parent', parent);
		gr.addQuery('child', child);
		gr.addQuery('type', relTypeSysId);
		gr.query();
		
		if (gr.next())
			return;
		
		gr.initialize();
		gr.setValue('parent', parent);
		gr.setValue('child', child);
		gr.setValue('type', relTypeSysId);
		gr.insert();
	}
	
	function addToItems(snapshot, className, sysId) {
		snapshot.items.push({
			"className": className,
			"sysId": sysId
		});
	}
	
	function addToRelations(snapshot, className, sysId) {
		snapshot.relations.push({
			"className": className,
			"sysId": sysId
		});
	}
	
	function createSnapshotForDiscoveredNetAppStorage(storageRecord) {
		
		//define related items to NetApp
		var referenceToStorageByHostedBy = {
			tables: ['cmdb_ci_fc_export', 'cmdb_ci_iscsi_export', 'cmdb_ci_storage_pool'],
			reference: 'hosted_by'
		};
		var referenceToStorageByComputer = {
			tables: ['cmdb_ci_fc_port', 'cmdb_ci_disk', 'cmdb_ci_storage_controller', 'cmdb_ci_storage_volume'],
			reference: 'computer'
		};
		//define ClusterMode and 7-mode patterns sys_ids, storageTable and filter
		var filterStringFor7mode = '7-mode';
		var pattern7Mode = 'b675b6e59f123200e9123758442e7092';
		var patternClusterMode = 'ca48623a9f2b32003f2492ec757fcf13';
		var storageTable = 'cmdb_ci_storage_server';
		
		var snapshot = {
			"items": [],
			"relations": []
		};
		
		if (storageRecord.short_description.toLowerCase().indexOf(filterStringFor7mode) != -1) {
			createRelatedItemsSnapshot(snapshot, storageTable, storageRecord, referenceToStorageByHostedBy, referenceToStorageByComputer, pattern7Mode);
			
		} else {
			createRelatedItemsSnapshot(snapshot, storageTable, storageRecord, referenceToStorageByHostedBy, referenceToStorageByComputer, patternClusterMode);
			
		}
		
	}
	
	function createRelatedItemsSnapshot(snapshot, storageTable, naRecord, referenceObjectHostedBy, referenceObjectComputer, patternMode) {
		//add the main ci to the snapshot
		addToItems(snapshot, storageTable, naRecord.sys_id + '');
		//add hosted_by reference items to the snapshot
		referenceObjectHostedBy.tables.forEach(function (ciType) {
			var grCiType = new GlideRecord(ciType);
			grCiType.addQuery(referenceObjectHostedBy.reference, naRecord.sys_id);
			grCiType.query();
			while (grCiType.next()) {
				addToItems(snapshot, ciType, grCiType.sys_id + '');
			}
		});
		//add computer reference items to the snapshot
		referenceObjectComputer.tables.forEach(function (ciType) {
			var grCiType = new GlideRecord(ciType);
			grCiType.addQuery(referenceObjectComputer.reference, naRecord.sys_id);
			grCiType.query();
			while (grCiType.next()) {
				addToItems(snapshot, ciType, grCiType.sys_id + '');
			}
		});
		
		//'cmdb_ci_ip_address' and 'cmdb_ci_network_adapter' handled separately since they reference the NetApp differently
		var grIpAddress = new GlideRecord('cmdb_ci_ip_address');
		grIpAddress.addQuery('nic.cmdb_ci', naRecord.sys_id);
		grIpAddress.query();
		var ipAddresses = [];
		while (grIpAddress.next()) {
			ipAddresses.push(grIpAddress.sys_id + '');
			addToItems(snapshot, 'cmdb_ci_ip_address', grIpAddress.sys_id + '');
		}
		
		var grNetWorkAdapter = new GlideRecord('cmdb_ci_network_adapter');
		grNetWorkAdapter.addQuery('cmdb_ci', naRecord.sys_id);
		grNetWorkAdapter.query();
		while (grNetWorkAdapter.next()) {
			addToItems(snapshot, 'cmdb_ci_network_adapter', grNetWorkAdapter.sys_id + '');
		}
		//main_ci can be parent and child based on the relationship types
		var grRelationsParent = new GlideRecord('cmdb_rel_ci');
		grRelationsParent.addQuery('parent', naRecord.sys_id);
		grRelationsParent.query();
		while (grRelationsParent.next()) {
			addToRelations(snapshot, 'cmdb_rel_ci', grRelationsParent.sys_id + '');
		}
		
		var grRelationsChild = new GlideRecord('cmdb_rel_ci');
		grRelationsChild.addQuery('child', naRecord.sys_id);
		grRelationsChild.query();
		while (grRelationsChild.next()) {
			addToRelations(snapshot, 'cmdb_rel_ci', grRelationsChild.sys_id + '');
		}
		
		//create the pattern snapshop into 'sa_payload_snapshot', check if it exists - update(), if not insert()
		var grSaPayloadSnapshot = new GlideRecord('sa_payload_snapshot');
		grSaPayloadSnapshot.addQuery('patern', patternMode);
		grSaPayloadSnapshot.addQuery('cmdb_ci', naRecord.sys_id);
		grSaPayloadSnapshot.query();
		if (grSaPayloadSnapshot.hasNext()) {
			while (grSaPayloadSnapshot.next()) {
				grSaPayloadSnapshot.ie_output = JSON.stringify(snapshot);
				grSaPayloadSnapshot.update();
				
			}
		} else {
			//the key for the snapshot
			grSaPayloadSnapshot.cmdb_ci = naRecord.sys_id;
			grSaPayloadSnapshot.pattern = patternMode;
			
			grSaPayloadSnapshot.ie_output = JSON.stringify(snapshot);
			
			grSaPayloadSnapshot.insert();
			
		}
		
	}
	
})();
