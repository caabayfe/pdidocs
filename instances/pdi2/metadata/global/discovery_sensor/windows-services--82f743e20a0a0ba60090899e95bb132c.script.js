new DiscoveryJSONSensor({
	
	processJSON: function(jsonResult) {        
		if (JSUtil.nil(related_data.data_array))
			return;
		
		this.addToRelatedList('cmdb_ci_windows_service', related_data.data_array, 'cmdb_ci', 'name');
    },
   
    type: "DiscoveryJSONSensor"
});
