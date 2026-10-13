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
// This function is used to trigger the clusters
// probe.  It copies the list of clusters to
// parms.mor_ids and returns true if there are
// any clusters (this function may be called with no
// clusters if there are other object types in the
// data object.)
function(parms, data) {
	var disableHostProbe = g_probe.getParameter('disable_host_probe'),
		disableHostStorageProbe = g_probe.getParameter('disable_host_storage_probe');

	// Support the old probe parameter to disable the cluster probe
	if ('' + g_probe.getParameter('disable_cluster_probe') == 'true')
		return false;

	// Copy parameters needed by subsequent sensors.
	if (disableHostProbe)
		parms.disable_host_probe = disableHostProbe;
	if (disableHostStorageProbe)
		parms.disable_host_storage_probe = disableHostStorageProbe;

	parms.mor_ids = JSON.stringify(data.cluster);
	return !!data.cluster;
}
