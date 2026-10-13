function(ciData, debug, sensor) {
	
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
			var serial = srls[i].serial_number;
			if (sn.isValid(srls[i].serial_number)) {
				srls[i].valid = true;
				rl.addRec(srls[i]);
			}
        }
        ciData.addRelatedList(rl);
    }
}
