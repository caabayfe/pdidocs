/**
 * Process all CIM Probe query results for a CIM ID Sensor.
 * @param { name: [XMLObj(//cimqueryset/cimquery/result/instance)],.. } results
 * @param CimCIData cimdata The CI data of the device being identified.
 * @param CimIDSensor sensor This sensor wrapping this function.
 * @throws DiscoveryException On error
 */
function process(results, cimdata, sensor) {
	var instance = sensor.getParameter('device_instance'),
		matches = instance.match(/\WName='([^']*)/);
	if (matches)
		cimdata.data.fabric_id = StorageWWN.parse(matches[1]);
}
