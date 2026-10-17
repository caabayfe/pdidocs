function(ciData, debug, sensor) {
	processNetworkAdapters();
	processSerialNumbers();

	function processNetworkAdapters() {
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

	function processSerialNumbers() {
		// add a related list for the serials we've found...
		var srls = related_data.srlArr;
		var ci_data = ciData.getData();


		if (JSUtil.notNil(related_data.serial_array)) {
			var sn =  new SncSerialNumber(related_data.serial_array);
			ci_data.serial_number = sn.get();
		}

		if (JSUtil.notNil(related_data.chassis_type))
			ci_data.chassis_type = related_data.chassis_type;

		addToCIData(ciData, srls);

		function addToCIData(ciData, srls) {
			var rl = new CIRelatedList('cmdb_serial_number', 'cmdb_ci');
			var sn = new SncSerialNumber();
			for(var i = 0; i < srls.length; i++){
				if (sn.isValid(srls[i].serial_number)) {
					srls[i].valid = true;
					rl.addRec(srls[i]);
				}
			}
			ciData.addRelatedList(rl);
		}
	}
}
