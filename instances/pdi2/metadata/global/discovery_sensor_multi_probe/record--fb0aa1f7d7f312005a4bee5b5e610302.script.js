function(result, ciData, debug, sensor) {
	var serial = null;
	var inventoryInfo = result.commands.command.result; 
	var infoParts = inventoryInfo.split(',');
	
	for (var i = 0; i < infoParts.length && !serial; i++){
		var info = infoParts[i].split(':');
		if (info[0].trim() == "SN")
			serial = info[1].trim();
	}
	
	var sn =  new SncSerialNumber();
	if (sn.isValid(serial))
			addToCIData(serial);
	
	function addToCIData(serial) {
        ciData.getData()['serial_number'] = serial;
		
        var sl = new CIRelatedList('cmdb_serial_number', 'cmdb_ci');
        var sr = {};
        sr[ 'serial_number_type' ] = 'system';
        sr[ 'serial_number' ]      = serial;
        sr[ 'valid' ]              = true;
        sl.addRec(sr);
        ciData.addRelatedList(sl);
	}
}
