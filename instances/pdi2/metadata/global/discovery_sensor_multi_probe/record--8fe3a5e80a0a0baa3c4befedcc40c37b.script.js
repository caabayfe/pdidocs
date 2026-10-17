function(result, ciData, debug, sensor) {
    var output = result.output;
    if (output === null || gs.nil(output))
        return;
    
    var adapters = sensor.getAdapters(output, null, 
        new RegExp("^(\\S+):\\s+(.*?)$", "g"),
        new RegExp("inet (\\S+)\\s+netmask (\\S+)", "g"), 
        null, 
        getMacAddress);

    sensor.addToCIData(adapters);
	
    // Take the IP address even though we don't use it because other sensors do use it
    // and this is to keep the signature in sync to be called from a common function
    // in the script include DiscoveryIDSensor
    function getMacAddress(output, adapterName, ipAddress) {
        var macRegex = new RegExp("^0x(\\S+).*?" + adapterName, "mg");
        var macMatch = macRegex.exec(output);

        if (macMatch)
            return macMatch[1];

        return "";
    }
	
}
