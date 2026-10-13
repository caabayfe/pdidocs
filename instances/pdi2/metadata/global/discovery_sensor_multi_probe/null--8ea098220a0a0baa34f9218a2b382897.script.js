function(ciData, debug, sensor) {
	if (related_data.warn)
		DiscoveryLogger.warn(related_data.warn, sensor.getSensorName(), sensor.getEccQueueId());

	var ci_data = ciData.getData();
	var tDataObj = related_data.tDataObj;

    if (gs.nil(tDataObj))
        return;
	
	if (JSUtil.notNil(tDataObj.manufacturer) || JSUtil.notNil(tDataObj.model_id)) {
        var mm = MakeAndModelJS.fromNames(tDataObj.manufacturer, tDataObj.model_id, "hardware");
        ci_data.manufacturer = mm.getManufacturerSysID();
        ci_data.model_id = mm.getModelNameSysID();
    }
    if (JSUtil.notNil(tDataObj.model_number))
        ci_data.model_number = tDataObj.model_number;

    var snm = new SerialNumberManager();
    if (JSUtil.notNil(tDataObj.system_serial_number))
        snm.add('system', tDataObj.system_serial_number);
    if (JSUtil.notNil(tDataObj.chassis_serial))
        snm.add('chassis', tDataObj.chassis_serial);
    if (JSUtil.notNil(tDataObj.uuid_serial))
        snm.add('uuid', tDataObj.uuid_serial);
    if (JSUtil.notNil(tDataObj.baseboard_serial))
        snm.add('baseboard', tDataObj.baseboard_serial);
	
    var srlArr = snm.getSerialsForCIData();
    if (JSUtil.notNil(srlArr))
        ci_data.serial_number = snm.getSerialNumber();
	
    addToCIData(ciData, srlArr);

	function addToCIData(ciData, srls) {
		var rl = new CIRelatedList('cmdb_serial_number', 'cmdb_ci');
		for(var i=0; i<srls.length; i++) {
			if (srls[i].valid)
				rl.addRec(srls[i]);
		}
		ciData.addRelatedList(rl);
	}
}		
