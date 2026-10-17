function(result, ciData, debug, sensor) {
    var output = result.output;
    if (output === null || gs.nil(output))
        return;
    
    var DMPU = new DiscoveryMacProfileUtils();
    var baseElements = DMPU.getBaseElement(output);
	if (JSUtil.nil(baseElements)) {
		var msg = "Unable to parse input payload for Mac OS X - Serial Number";
		sensor.getLogger().warn(msg);					
		return;
	}	
    var section = baseElements[0];
    var serial = section['_items'][0]['serial_number'];
    
    // since Macs only have one serial number, we'll always insert the one we have in the base record, and we'll assume it's valid...
    ciData.getData()['serial_number'] = serial;
    var sl = new CIRelatedList('cmdb_serial_number', 'cmdb_ci');
    var sr = {};
    sr[ 'serial_number_type' ] = 'standard';
    sr[ 'serial_number' ]      = serial;
    sr[ 'valid' ]              = true;
    sl.addRec(sr);
    ciData.addRelatedList(sl);

    // Get the make and model information.
    var model = section['_items'][0]['machine_model'];
    var mm = MakeAndModelJS.fromNames("Apple", model, "hardware");
    ciData.getData()['model_id'] = mm.getModelNameSysID();
    ciData.getData()['manufacturer'] = mm.getManufacturerSysID();
}
