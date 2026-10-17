new DiscoveryJSONSensor({
	
	processJSON: function() {        
		if (JSUtil.nil(related_data.packages))
			return;
		var sourceName = gs.getProperty('glide.discovery.source_name', "ServiceNow");
		related_data.packages.forEach(function(obj) {
                  obj.discovery_source = sourceName;
               	});
		
		this.addToRelatedList('cmdb_ci_os_packages', related_data.packages, 'cmdb_ci', 'name');
		this.clearPatches();
    },
	
	// remove all patch records associated with this ci
	clearPatches: function() {
		var deviceCI = this.getCmdbRecord();
		var sysId = deviceCI.sys_id;
		var gr = new GlideRecord('cmdb_ci_patches');
		gr.addQuery('cmdb_ci', sysId);
		gr.query();
		gr.deleteMultiple();
	},
	
    type: "DiscoveryJSONSensor"
});
