// parms: Object containing parameters to pass to
//        the probe being triggered.
// data:  Data provided by the sensor.
// return: true to trigger the probe
// This function is called by the clusters sensor.
// parms contains the known parameters for all vCenter
// probes: vcenter ID, datacenter ID, etc.
// data is an object containing one array:
//   host: list of hosts being discovered
// This function is used to trigger the host
// probe.  It copies the list of hosts to
// parms.mor_ids and returns true to trigger the
// probe.
function(parms, data) {
	var disableHostStorageProbe = g_probe.getParameter('disable_host_storage_probe');

	// Support the old probe parameter to disable the host probe
	if ('' + g_probe.getParameter('disable_host_probe') == 'true')
		return false;

	// Copy parameters needed by subsequent sensors.
	if (disableHostStorageProbe)
		parms.disable_host_storage_probe = disableHostStorageProbe;

	parms.mor_ids = JSON.stringify(data.host);
	return true;
}
