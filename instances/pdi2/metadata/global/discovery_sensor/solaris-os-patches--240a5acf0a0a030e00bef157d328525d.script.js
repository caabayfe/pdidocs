new DiscoveryJSONSensor({
	
	processJSON: function() {        
		if (JSUtil.nil(related_data.patches))
			return;
		
		this.addToRelatedList('cmdb_ci_patches', related_data.patches, 'cmdb_ci', 'name');
    },
   
    type: "DiscoveryJSONSensor"
});
