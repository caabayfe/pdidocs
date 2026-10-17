function(result, ciData, debug, sensor) {
	var ci_data = ciData.getData();
	ci_data['routes'] = null;
	
	//Return null if the result is empty 
	if (!result.commands || !result.commands.command) 
		return; 
	
	var output = result.commands.command.result;
    if (gs.nil(output))
        return;
	
	var lines = output.split('\n');
	var routes = {};
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var columns = line.split(/\s+/);
		if (! columns[0].match(/\d+\)/))
			continue;
		var route = {}; 
		//The header of the information: Network Netmask Gateway/OwnedIP State Traffic Domain Type
		route.network = columns[1];
		route.netmask = columns[2];
		route.traffic_domain = null;
		if (columns[5])
			route.traffic_domain = columns[5];
		
		// Index based on the gateway
		routes[columns[3]] = route;
	}
	ci_data['routes'] = routes; 
  
}		
