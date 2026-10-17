// parms: Object containing parameters to pass to
//        the probe being triggered.
// data:  Data provided by the sensor.
// return: true to trigger the probe
// This function is called by the ESX Hosts sensor.
// parms contains the known parameters for all vCenter
// probes: vcenter ID, datacenter ID, etc.
// data is an object containing one array:
//   host: list of hosts being discovered
// This function is used to trigger the host storage
// probe.  It copies the list of hosts to
// parms.mor_ids and returns true if there's a 'storage'
// list (this function may be called with no storage
// list if there are other object types in the data
// object.)
function (parms, data) {
	if (data.clusters == undefined)
		return false;
    parms.clusters = JSON.stringify(data.clusters);
    return true;
}
