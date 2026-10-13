function(ciData, debug, sensor) {
    var nics = new CIRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
    ciData.addRelatedList(nics);
	
	var adapters = related_data.adapters;
	
	if (JSUtil.notNil(related_data.ip_default_gateway))
		ciData.data.default_gateway = related_data.ip_default_gateway;

    for(var i = 0; i < adapters.length; i++) {
		var adapter = adapters[i];
        var mm = MakeAndModelJS.fromNames(adapter.manufacturer, null);
        adapter.manufacturer = mm.getManufacturerSysID();
   
        nics.addRec(adapter);
		
		//set the default_gateway for the computer CI:
		if(JSUtil.notNil(adapter.ip_default_gateway))
			ciData.data.default_gateway = adapter.ip_default_gateway;
    }
}
