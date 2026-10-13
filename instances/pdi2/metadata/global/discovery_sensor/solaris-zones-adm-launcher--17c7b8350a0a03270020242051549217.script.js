new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var zoneList = new XMLHelper(output).toObject();

        if (!zoneList) {
            this._triggerAdmForGlobalZone();
            return;
		}

		// If global zone
        if (zoneList.id == "0") {
            this._triggerAdmForGlobalZone();
            var zones = g_array_util.ensureArray(zoneList.zone);
            if (zones.length == 0)
                return;

            this.processZones(this._findOrCreateZoneServer(), zones);
        } else
            current.correlation_id = "zone-" + zoneList.id;
    },

	/*
	* If a zone already exists, we make sure relationships (vm to zone server & vm to instance) are updat-to-date
	* If a zone no longer exists, we remove relationships (vm to zone server & instance to zone server)
	* If a zone is new, we see if it already exists
	*   If it exists, migrate the relationships (vm to zone server & instance to zone server) to the new zone server
	*   if it does NOT exist, create a new instance record and link up all relationships
	*/
    processZones: function(zoneServerGr, zones) {
		var oldZonesIds = this._findExistingZoneInstances(zoneServerGr);
		this._reconcileZoneInstances(oldZonesIds, zones, zoneServerGr); 		
	},
	
	_findExistingZoneInstances: function(zoneServerGr) {
		var relation = "Registered on::Has registered";
		var zonesIds = [];
		
        var gr = new GlideRecord("cmdb_rel_ci");
        gr.addQuery('child', zoneServerGr.sys_id);
        gr.addQuery('type', g_disco_functions.findCIRelationshipType("cmdb_rel_type", relation));
        gr.query();
        while (gr.next()) {
			if (JSUtil.nil(gr.parent))
				continue;
			
            zonesIds.push(gr.parent.correlation_id + '');
        }		
		
		return zonesIds;
	},

	_reconcileZoneInstances: function(oldZoneIds, zones, zoneServerGr) {
		var zoneDataMap = {};
		var discoveredZoneIdMap = {};
		var discoveredZoneIds = [];
		for (var i = 0; i < zones.length; i++) {
			
			if ((zones[i].status +'') == 'configured')
				continue;
			var id = zones[i].id +'';
			var status = (zones[i].status +'') === 'running' ? 'on' : 'off';
			discoveredZoneIdMap[id] = true;
			if (!zoneDataMap[id])
				zoneDataMap[id] = {};
			zoneDataMap[id].status = status;
			zoneDataMap[id].name = zones[i].name;
			discoveredZoneIds.push(id);
		}
		
		var existingZoneIds = [];
		var removedZoneIds = [];
		var addedZoneIds = [];
		
		for (var i=0; i<oldZoneIds.length; i++) {
			var oldId = oldZoneIds[i];
			if (discoveredZoneIdMap[oldId])
				existingZoneIds.push(oldId);
			else
				removedZoneIds.push(oldId);				
		}
		
		addedZoneIds = new ArrayUtil().diff(discoveredZoneIds, existingZoneIds);
		
		this._updateAddedZoneInstances(addedZoneIds, zoneServerGr, zoneDataMap);
		this._updateExistingZoneInstance(existingZoneIds, zoneServerGr, zoneDataMap);
		this._updateRemovedZoneInstances(removedZoneIds, zoneServerGr);
	},

	_updateExistingZoneInstance: function(zoneIds, zoneServerGr, zoneDataMap) {
		if (zoneIds.length == 0)
			return;

		for (var i=0; i<zoneIds.length; i++) {
			var zoneId = zoneIds[i];
			
			var ingr = this._getSolarisInstance(zoneId, zoneServerGr);
			if (!ingr)
				continue;

			ingr.state = zoneDataMap[zoneId].status;
			ingr.name = zoneDataMap[zoneId].name;
			ingr.update();

			// update sys_object_source for the VM instance record
			var sourceName = gs.getProperty("glide.discovery.source_name", "ServiceNow");
			var os = new ObjectSource(sourceName, ingr.sys_class_name, ingr.sys_id);
			os.setValue("last_scan", new GlideDateTime().getDisplayValue());
			os.process();

			var sgr = this._getSolarisVM(zoneId);
			if (!sgr)
				continue;
			
			this._relateVMToInstance(sgr, ingr);
			this._relateVMToHyperVisor(sgr, zoneServerGr);
			this._triggerAdmForLocalZone(sgr, zoneDataMap[zoneId].name);
		}		
	},
	
	_updateRemovedZoneInstances: function(zoneIds, zoneServerGr) {
		if (zoneIds.length == 0)
			return;
		
		for (var i=0; i<zoneIds.length; i++) {
			var zoneId = zoneIds[i];
			
			var ingr = this._getSolarisInstance(zoneId, zoneServerGr);
			if (!ingr)
				continue;

			// Since we did not discover this pre-existing zone, mark state as 'retired'
			ingr.state = "retired";
			ingr.update();

			// Remove relationship between instance and hypervisor
			var relgr = g_disco_functions.relationshipExists(ingr, zoneServerGr, "Registered on::Has registered");
			if (relgr)
				relgr.deleteRecord();
			
			// Remove relationship between vm and hypervisor, but first look for vm
			// It's arguable how we should we look for the vm. Here we go with simply by looking up the identifier on 
			// the target server, but one car argue we might need to look it up by traverse the relationship between
			// the instance and VM. 			
			var sgr = this._getSolarisVM(zoneId);
			if (!sgr)
				continue;
			
			var relgr = g_disco_functions.relationshipExists(sgr, zoneServerGr, "Virtualized by::Virtualizes");
			if (relgr)
				relgr.deleteRecord();			
		}
		
	},
	
	/*
	* If we found a zone instance record, then we migrate the associated relationships.
	* Otherwise we create a new zone instance record, and attempt to create all the associated relationships
	*/
	_updateAddedZoneInstances: function(zoneIds, zoneServerGr, zoneDataMap) {
		if (zoneIds.length == 0)
			return;
		
		for (var i=0; i<zoneIds.length; i++) {
			var zoneId = zoneIds[i];
			
			var ingr = this._getSolarisInstance(zoneId, zoneServerGr);
			if (ingr) {
				ingr.state = zoneDataMap[zoneId].status;
				ingr.name = zoneDataMap[zoneId].name;
				ingr.update();

				// Clean up relationship(s) between instance and hypervisor
				var relgr = new GlideRecord("cmdb_rel_ci");
				relgr.addQuery('parent', ingr.sys_id);
				relgr.addQuery('type', g_disco_functions.findCIRelationshipType("cmdb_rel_type", "Registered on::Has registered"));
				relgr.query();
				while (relgr.next()) // Arguably should be an if, but just in case there are duplicates.
    				relgr.deleteRecord();

				// Now migrate the new relationship...
				this._relateInstanceToHyperVisor(ingr, zoneServerGr);
				
				// Clean up relationship(s) between vm and hypervisor
				var sgr = this._getSolarisVM(zoneId);
				if (!sgr)
					continue;
				
				var relgr = new GlideRecord("cmdb_rel_ci");
				relgr.addQuery('parent', sgr.sys_id);
				relgr.addQuery('type', g_disco_functions.findCIRelationshipType("cmdb_rel_type", "Virtualized by::Virtualizes"));
				relgr.query();
				while (relgr.next()) // Arguably should be an if, but just in case there are duplicates.
    				relgr.deleteRecord();
				
				// Now migrate the new relationship
				this._relateVMToHyperVisor(sgr, zoneServerGr);
				this._triggerAdmForLocalZone(sgr, zoneDataMap[zoneId].name);
			} else {
				ingr = new GlideRecord("cmdb_ci_solaris_instance");
				ingr.name = zoneDataMap[zoneId].name;
				ingr.correlation_id = zoneId;
				ingr.state = zoneDataMap[zoneId].status;
				ingr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
				ingr.insert();

				this._relateInstanceToHyperVisor(ingr, zoneServerGr);
				
				var sgr = this._getSolarisVM(zoneId);
				if (!sgr)
					continue;

				this._relateVMToInstance(sgr, ingr);
				this._relateVMToHyperVisor(sgr, zoneServerGr);
				this._triggerAdmForLocalZone(sgr, zoneDataMap[zoneId].name);
			}
			
			// update sys_object_source for the VM instance record
			var sourceName = gs.getProperty("glide.discovery.source_name", "ServiceNow");
			var os = new ObjectSource(sourceName, ingr.sys_class_name, ingr.sys_id);
			os.setValue("last_scan", new GlideDateTime().getDisplayValue());
			os.process();
		}

	},

	_triggerAdmForGlobalZone: function() {
		var shouldTriggerAdme = DiscoveryADMEConditions.shouldTriggerADME(this.getDiscoverySource());
		var probe;
		
		if (shouldTriggerAdme) {
			probe = SncProbe.get("Unix - ADM Enhanced");
			probe.setTopic("TrafficBasedDataCollectionUnix");
			probe.addParameter("probe_name", "Unix - ADM Enhanced");
		} else {
			probe = SncProbe.get('Solaris - ADM');
		probe.setTopic("MultiProbe");
			probe.addParameter("probe_name", "Solaris - ADM");
			probe.addParameter("zone", "global");
		}
		
		probe.addParameter("ci_sys_id", this.getCmdbRecord().sys_id);
		probe.addParameter("cmdb_ci", this.getCmdbRecord().sys_id);
		probe.setSource(g_probe.getSource());
		probe.addParameter("port", this.getParameter("port"));
		probe.addParameter("os_type", "SOLARIS");
		probe.addParameter("protocol", "SSH");
		probe.setCorrelator(g_probe.getCorrelator());
		probe.setMidSelectDetails(this.getParameter("mid_selector_details"));
		probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
	},

	_triggerAdmForLocalZone: function(vm, zoneName) {
		var probe = SncProbe.get('Solaris - ADM');
		probe.setTopic("MultiProbe");
		probe.addParameter("cmdb_ci", vm.sys_id);
		probe.addParameter("ci_sys_id", vm.sys_id);
		probe.addParameter("zone", zoneName);
		probe.setSource(g_probe.getSource());
		probe.addParameter("port", this.getParameter("port"));
		probe.addParameter("os_type", "SOLARIS");
		probe.addParameter("protocol", "SSH");
		probe.addParameter("probe_name", "Solaris - ADM");
		probe.setCorrelator(g_probe.getCorrelator());
		probe.setMidSelectDetails(this.getParameter("mid_selector_details"));
		probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
	},

	_relateVMToInstance: function(vm, instance) {
		g_disco_functions.createRelationshipIfNotExists(vm, instance, "Instantiates::Instantiated by");
	},
	
	_relateVMToHyperVisor: function(vm, hypervisor) {
		g_disco_functions.createRelationshipIfNotExists(vm, hypervisor, "Virtualized by::Virtualizes");		
	},
	
	_relateInstanceToHyperVisor: function(instance, hypervisor) {
		g_disco_functions.createRelationshipIfNotExists(instance, hypervisor, "Registered on::Has registered");
	},
	
	_getSolarisInstance: function(zoneId, zoneServerGr) {

		var relgr = new GlideRecord('cmdb_rel_ci'),
			ingr = new GlideRecord('cmdb_ci_solaris_instance');

		relgr.addQuery('child', zoneServerGr.sys_id);
		relgr.addQuery('type', g_disco_functions.findCIRelationshipType("cmdb_rel_type", "Registered on::Has registered"));
		relgr.addQuery('parent.correlation_id', zoneId);
		relgr.query();

		if (relgr.next()) {
			ingr.get('sys_id', relgr.parent + '');
			return ingr;
		}

		return;
	},
	
	_getSolarisVM: function(zoneId) {
		
		var gr = new GlideRecord('cmdb_ci_solaris_server');
	    gr.addQuery('correlation_id', "zone-" + zoneId);
    	gr.query();
		if (gr.next())
			return gr;
				
		return;		
	},

    _findOrCreateZoneServer: function() {
        var zsys_id = "";
        var zgr = new GlideRecord('cmdb_ci_vm_zones');
        zgr.addQuery('correlation_id', this.getCmdbCi());
        zgr.query();
        if (zgr.next())
            return zgr;

        var gr = this.getCmdbRecord();
        if (!gr)
            return;

        zgr.initialize();
        zgr.name = "Zone Server@" + gr.name;
        zgr.correlation_id = gr.sys_id;
		zgr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
        zgr.insert();

        g_disco_functions.createRelationshipIfNotExists(zgr, this.getCmdbRecord(), "Runs on::Runs");

        return zgr;
    },

    type: "DiscoverySensor"
});
