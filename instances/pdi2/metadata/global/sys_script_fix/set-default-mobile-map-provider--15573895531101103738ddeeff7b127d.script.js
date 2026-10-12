(function(){
	var customMapProvider = new GlideRecord("sys_sg_custom_map_provider");

	if (!customMapProvider.isValid())
		return;
	
	customMapProvider.addEncodedQuery("map_providerISEMPTY");
	customMapProvider.query();
	customMapProvider.setValue("map_provider", "mappedin");	
	customMapProvider.updateMultiple();
})();
