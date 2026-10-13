// parms: Object containing parameters to pass to
//        the probe being triggered.
// data:  Data provided by the sensor.
// return: true to trigger the probe
// This function is called by the Datacenters sensor.
// parms contains the known parameters for all vCenter
// probes: vcenter ID, datacenter ID, etc.
// data is an object containing up to 4 arrays:
//   vm: list of vms being discovered
//   datastore: list of datastores being discovered
//   network: list of networks being discovered
//   cluster: list of clusters being discovered
// This function is used to trigger the datastore
// probe.  It copies the list of datastores to
// parms.mor_ids and returns true if there are
// any datastores (this function may be called with no
// datastores if there are other object types in the
// data object.)
function(parms, data) {
	// Support the old probe parameter to disable the datastore probe
	if ('' + g_probe.getParameter('disable_datastore_probe') == 'true')
		return false;

	parms.mor_ids = JSON.stringify(data.datastore);
	return !!data.datastore;
}
