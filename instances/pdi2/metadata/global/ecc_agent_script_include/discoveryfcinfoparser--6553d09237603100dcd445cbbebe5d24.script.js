/**
 * Parses the output of the "fcinfo.exe" command into JS objects, based on command arguments.
 * 
 * @since fuji
 * @author roy.laurie
 *
 ** 
 * @param {} options Configuration options.
 */
var DiscoveryFcInfoParser = function(options) {
	// save any configuration options
};

DiscoveryFcInfoParser.prototype.type = 'DiscoveryFcInfoParser';

/**
 * Parses the output of the "fcinfo /details" command and creates a JS object for each
 * row of data provided.
 * @return [] An array of table objects in the format
 */
DiscoveryFcInfoParser.prototype.parseDetails = function(fcinfoOutputLines) {
	var output = []; // returned
	var currentTable = {};
	var hasFields = false; // keeps track of currentTable status
	
	// iterate over each trimmed line, new tables via blank lines, and populating the output accordingly.
	for (var l = 0; l < fcinfoOutputLines.length; ++l) {
		var line = fcinfoOutputLines[l].trim();
		
		// empty lines signify new table
		if (line.length === 0) {
			// push the previous table into the output obj
			if (hasFields)
				output.push(currentTable);

			// create a new table and set it as current
			currentTable = {};
			hasFields = false;
			continue;
		}
		
		// table header - create a new current table
		var matches = line.match(/^(\w+): (.*)$/);
		if (matches === null)
			continue;
		
		// table field - append the data to the current table
		currentTable[matches[1].trim()] = matches[2].trim(); 
		hasFields = true;
	}
	
	// push the last table into output
	if (currentTable !== null && hasFields)
		output.push(currentTable);
	
	return output;
};

/**
 * @return [] An array of ports in the format: {
 *   { adapter, Type, State, Speed, WWN, PortWWN }
 */
DiscoveryFcInfoParser.prototype.parsePorts = function(fcinfoOutputLines) {
	var output = [];
	var currentAdapterName = null;
	
	var addedEntry = false;
	for (var i = 0; i < fcinfoOutputLines.length; ++i) {
		var line = fcinfoOutputLines[i].trim();
		
		var matches = line.match(/^(.+?), num: \d+/); // adapter header. 1 => adapter name
		if (matches !== null) {			
			currentAdapterName = matches[1];
			addedEntry = false;
			continue;
		}
		
		// handle parsing rows
		var columns = line.split(/,/);
		if (columns.length != 5)
			continue;
		

		if (addedEntry) {
			output[output.length-1].targetWWNS.push({ WWN: columns[3].trim(), PortWWN: columns[4].trim()});
		}
		else {	
		output.push({
			adapter: currentAdapterName,
			Type: columns[0].trim(),
			State: columns[1].trim(),
			Speed: columns[2].trim(),
			WWN: columns[3].trim(),
			PortWWN: columns[4].trim(),
			targetWWNS: []
		});
		addedEntry = true;
		}
	}
	
	return output;
};

/**
 * @return [] An array of adapters in the format: {
 *   { adapter: string, devices: [ DeviceName, B, T, L, mappings: [ FcId, WWNN, RemoteWWN, L ] ] }
 */
DiscoveryFcInfoParser.prototype.parseFcpMap = function(fcinfoOutputLines) {
	var output = []; // returned
	var currentAdapter = null;
	var currentDevice = null;
	
	// iterate over each trimmed line
	for (var i = 0; i < fcinfoOutputLines.length; ++i) {
		var line = fcinfoOutputLines[i].trim();
		
		// example catalog header:
		// com.qlogoic-QLE2562-0: num: 2
		var matches = line.match(/^(.+?): num: \d+/); // adapter header. 1=> adapter name
		if (matches !== null) {
			if (currentAdapter !== null)
				output.push(currentAdapter);
			
			currentAdapter = { adapter: matches[1].trim(), devices: [] };
			currentDevice = null;
			continue;
		}
		
		// if this is the storage device table, parse the next line - incrementing i
		if (line.match(/^\(DeviceName,/) !== null) {
			var nextLine = fcinfoOutputLines[++i].trim();
			 // remove the enclosing ( )
			nextLine = nextLine.substring(1, nextLine.length - 1);
			// split into columns. column names match output
			var columns = nextLine.split(/,/); 
			// create device
			currentDevice = {
				DeviceName: columns[0].trim(),
				B: columns[1].trim(),
				T: columns[2].trim(),
				L: columns[3].trim(),
				mappings: null // initialized later
			};
			
			currentAdapter.devices.push(currentDevice);
			continue;
		}
		
		// parse each mapping row, initializing currentDevice.mappings on the header row
		if (line.match(/^\(.*\)$/) !== null) {
			// if this is the mapping header line, setup the array, then iterate
			if (currentDevice.mappings === null) {
				currentDevice.mappings = [];
				continue;
			}
			
			 // remove the enclosing ( )
			line = line.substring(1, line.length - 1);
			// split into columns. column names match output
			var columns = line.split(/,/); 
			// create the mapping. column names match original output
			currentDevice.mappings.push({
				FcId: columns[0].trim(),
				WWN: columns[1].trim(),
				PortWWN: columns[2].trim(),
				L: columns[3].trim()
			});
		}
	}
	
	if (currentAdapter !== null)
		output.push(currentAdapter);
	
	return output;
};
