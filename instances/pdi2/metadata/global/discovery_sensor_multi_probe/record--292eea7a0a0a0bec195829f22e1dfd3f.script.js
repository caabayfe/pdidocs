function(result, ciData, debug, sensor) {
    var output = result.output;
    if (output === null || gs.nil(output))
        return;
    
    var DMPU = new DiscoveryMacProfileUtils();
    var baseElements = DMPU.getBaseElement(output);
	if (JSUtil.nil(baseElements)) {
		var msg = "Unable to parse input payload for Mac OS X - OS Revision";
		sensor.getLogger().warn(msg);					
		return;
	}
	
    var section = baseElements[0];

    var items = section['_items'][0];
    var ci_data = ciData.getData();

    ci_data.os_service_pack = items['kernel_version'];
    ci_data.os_version = items['os_version'];
        
    // reclassify this guy if we've got a server OS...
    if (items['os_version'].match('Server')) {
        gs.log("sys class name should be cmdb_ci_osx_server");
        ci_data.sys_class_name = 'cmdb_ci_osx_server';
        if (g_device)
            g_device.setClassifiedAs("cmdb_ci_osx_server");
    }
}
