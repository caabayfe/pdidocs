new CimIDSensor({
	_VALID_DISCOVERED_RELATIONSHIP_TABLES: [
		'cmdb_ci_storage_server',
		'cmdb_ci_storage_switch'
	],
	
	after: function() {
		CimIDSensor.prototype.after.apply(this, arguments);

		// CISysID is set after either a successful identify() or insert()
		this.relateDiscoveredToDiscovers(''+this.CISysID);
	},
	
	_relateDiscoveredToDiscovers: function(discoversSysId) {
		// get the relationship type for later
		var relTypeId = g_disco_functions.findCIRelationshipTypeByDesc('cmdb_rel_type', 'Discovers', 'Discovered from');
		if (relTypeId === '')
			throw 'Unable to find "Discovers::Discovered from" relationship type';
		
		var deviceHistory = this.getDeviceHistory();
		var deviceHistorySysId = ''+deviceHistory.getDeviceRecord().sys_id;
		var parentDeviceHistorySysId = deviceHistory.getScratchpadValue('parentDeviceHistorySysId');
		// build the JSON string to match sibling histories against
		var scratchPadStr = '"parentDeviceHistorySysId":"' + parentDeviceHistorySysId + '"';
		var discoveryStatusSysId = this.getAgentCorrelator();

		// find all device histories for this discovery status
		var historiesGr = new GlideRecord('discovery_device_history');
		historiesGr.addQuery('sys_id', '!=', deviceHistorySysId); // ignore current history history
		historiesGr.addQuery('status', discoveryStatusSysId); // match against current status
		historiesGr.addQuery('scratchpad', 'CONTAINS', scratchPadStr); // only child histories
		var cp = deviceHistory.getClassificationProbe();
		if (cp)
			historiesGr.addQuery('classification_probe', cp);
		historiesGr.query();

		// perform a lock to prevent double insertion
		var key = 'discoveredToDiscovers:' + discoversSysId;
		var mutex_metric_name = 'CIM - Identity - WBEM Service';
		var mutex = new SelfCleaningMutex(key, mutex_metric_name);
		mutex.setSpinWait(200); // 200 ms
		mutex.setMaxSpins(1500); // 5 mins
		
		// quit if a mutex can't be grabbed
		if (!mutex.get()) {
			this.warn('Unable to create to lock on CimSensor mutex for: ' + key);
			return;
		}
		
		try {
			while (historiesGr.next()) {
				// do not create "Discovers::Discovered from" relationships for devices
				// that we will discover if WBEM probes are fired as supplemental; Windows, Linux, etc.
				var ciTable = ''+historiesGr.cmdb_ci.sys_class_name;
				if (!this._isValidDiscoveredRelationshipTable(ciTable))
					continue;
			
				var discoveredSysId = ''+historiesGr.cmdb_ci.sys_id;

				// determine whether a relationship already exists
				var existingGr = new GlideRecord('cmdb_rel_ci');
				existingGr.addQuery('parent', discoversSysId);
				existingGr.addQuery('type', relTypeId);
				existingGr.addQuery('child', discoveredSysId);
				existingGr.query();
				
				// skip if the child CI if the relationship exists
				if (existingGr.hasNext())
					continue;
				
				// insert a relationship
				var relGr = new GlideRecord('cmdb_rel_ci');
				relGr.parent = discoversSysId;
				relGr.type = relTypeId;
				relGr.child = discoveredSysId;
				relGr.insert();
			}
		} finally {
			mutex.release();
		}
	},
	
	after: function() {
		CimSensor.prototype.after.apply(this, arguments);

		// CISysID is set after either a successful identify() or insert()
		this._relateDiscoveredToDiscovers(''+this.getCmdbCi());
	},
	
	_isValidDiscoveredRelationshipTable: function(childTableName) {
		return ( JSUtil.contains(this._VALID_DISCOVERED_RELATIONSHIP_TABLES, childTableName) );
	},
	
	versionEra: 'berlin',
    type: 'DiscoveryCimWbemServiceIdSensor'
});
