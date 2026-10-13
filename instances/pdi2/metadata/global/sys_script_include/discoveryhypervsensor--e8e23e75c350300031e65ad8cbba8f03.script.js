var DiscoveryHyperVSensor = Class.create();
DiscoveryHyperVSensor.prototype = Object.extendsObject(DiscoverySensor, {
   
    process: function(result) {	   
	    this.serverCI = this.getCmdbRecord();
	   
		//if we're dealing with WS2008 CI, get/create the associated hyperV CI
		if(this.serverCI.sys_class_name == "cmdb_ci_win_server") {
			this.winCI = this.serverCI;
			this.serverCI = this.getHypervServerCi();

			g_disco_functions.createRelationshipIfNotExists(this.serverCI, this.winCI, "Runs on::Runs");

			// We previously did a couple of things in error: the Hyper-V host was marked as virtual
			// and we created a 'virutalizes' relationship with it.  Checking for winCI.virtual will
			// (hopefully) avoid the cost of checking to see if we need to clean up data in most cases.
			if (this.winCI.virtual) {
				var rel = g_disco_functions.relationshipExists(this.winCI, this.serverCI, "Virtualized by::Virtualizes");
				if (rel) {
					rel.deleteRecord();

					// See if winCI is virtualized by anything else.  If not, clear the virtual flag.
					var relationType = this.findCIRelationshipType("cmdb_rel_type", "Virtualized by::Virtualizes");
					var gr = new GlideRecord("cmdb_rel_ci");
					gr.addQuery("child", this.winCI);
					gr.addQuery("type", relationType);
					gr.query();
					if (!gr.hasNext())
						this.winCI.virtual = false;
				}
			}
		}

		//Subclass implements processResult()
	   this.processResult(result);
    },
	
	getHypervServerCi: function() {
		var fieldsToCopy = ["name", "os_service_pack", "manufacturer",
				"model_id","short_description","os_address_width",
				"os", "host_name", "ip_address", "location",
				"chassis_type", "os_version", "assigned_to", "discovery_source",
				"first_discovered", "last_discovered", "fqdn", "default_gateway"];
		var gr = new GlideRecord("cmdb_ci_hyper_v_server");
		var doUpdate = true;
		gr.addQuery("windows_host", this.winCI.sys_id);
		gr.query();

		// Check if any work to do
		var equals = true;
		if (gr.next()) {
			// Rec exists, see if need to update data discovered by Windows classify and OS Info sensors
			for (var i=0; i < fieldsToCopy.length; i++) {
				if (gr[fieldsToCopy[i]] != this.winCI[fieldsToCopy[i]]) {
					equals = false;
					break;
				}
			}
			if (equals)
				return gr;   // nothing to do
		}

		// Create or update rec inside a mutex
		var mutexName = "HyperV Server with windows host " +  this.winCI.sys_id;
		var mutex = new GlideSelfCleaningMutex(mutexName, mutexName);
		mutex.setSpinWait(200);
		if (!mutex.get())
			throw "Could not acquire mutex " + mutexName;  // DB exception, or wait time expired
		try {
			gr.initialize();
			gr.addQuery("windows_host", this.winCI.sys_id);
			gr.query();
			if (!gr.next()) {
				doUpdate = false;
	
				// Create the server CI
				gr.initialize();
				gr.windows_host = this.winCI.sys_id;
			}
		
			// Copy over data discovered by Windows classify and OS Info sensors
			for (var k=0; k < fieldsToCopy.length; k++)
				gr[fieldsToCopy[k]] = this.winCI[fieldsToCopy[k]];

			gr.serial_number = this.winCI.serial_number;
			gr.virtual = true;
			
			
			if (doUpdate)
				gr.update();
			else 
				gr.insert();

			var sourceName = gs.getProperty('glide.discovery.source_name', "ServiceNow");
			var os = new ObjectSource(sourceName, gr.sys_class_name, gr.sys_id);
			os.setValue("last_scan", new GlideDateTime().getDisplayValue());
			os.process();

			return gr;
		} finally {
			mutex.release();
		}
   },
	
	extractUuid: function(instanceId) {
	   var instanceIdRegex = /Microsoft:([^\\]*)\\?.*$/;
	   var match = instanceIdRegex.exec(instanceId);
	   return match ? match[1] : null;
    },

    type: 'DiscoveryHyperVSensor'
});
