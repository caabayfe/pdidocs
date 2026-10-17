/**
 * Process all CIM Probe query results for a CIM ID Sensor.
 * @param { name: [XMLObj(//cimqueryset/cimquery/result/instance)],.. } results
 * @param CimCIData cimdata The CI data of the device being identified.
 * @param CimIDSensor sensor This sensor wrapping this function.
 * @throws DiscoveryException On error
 */
function process(results, cimdata, sensor) {
    if (results.cimom.length !== 1) {
		DiscoveryLogger.warn('CIMOM information not provided. Skipped CI.', 'CIM - WBEM Service', sensor.getEccQueueId(), null);
		return;
	}
	
	var cimomData = results.cimom[0];

	cimdata.data.name = 'WBEM Service @ ' + sensor.getSource();
	cimdata.data.cim_object_path = cimomData._path;
	cimdata.data.tcp_port = ''+sensor.getParameter('port');
	cimdata.data.version = cimomData.Version || '';
	cimdata.data.short_description = cimomData.Description;

	if (!cimomData._path) {
		var vals = [];
		for (var name in cimomData._key)
			vals.push(name + '=\'' + cimomData._key[name] + '\'');
		if (vals.length)
			cimdata.data.cim_object_path = sensor.getParameter('namespace') + '/' + cimomData._classname + '{' + vals.join(',') + '}';
	}
}
