function(result, ciData, debug, sensor) {
    var ci_data = ciData.getData();
	ci_data.arp = null ; 
	
	// Return null if the probe doesn't return result back from the device
	if (!result.commands || !result.commands.command) 
		return; 
	
	
	var output = result.commands.command.result;
    if (gs.nil(output))
        return;
	
	var lines = output.split('\n');
	var route_interfaces = {};
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var columns = line.split(/\s+/);
		if (! columns[0].match(/\d+\)/))
			continue;
		var route_interface = {}; 
		
		// The result header:  IP  MAC Iface VLAN  Origin     TTL     Traffic Domain
		route_interface.mac_address = columns[2];
		route_interface.iface = columns[3];
		route_interface.traffic_domain = null; 
		
		if(columns[7])
			route_interface.traffic_domain = columns[7];
		// Index based on the ip_address
		route_interfaces[columns[1]] = route_interface;
	}
	ci_data.arp = route_interfaces;
}		
