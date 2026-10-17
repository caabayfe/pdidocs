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
// This function is used to trigger the VM
// probe.  It copies the list of vms to
// parms.mor_ids and returns true if there are
// any VMs (this function may be called with no VMs
// if there are other object types in the data object.)
function(parms, data) {
	var disableVNics = g_probe.getParameter('disable_vm_nic_vnics'),
		disableVDisks = g_probe.getParameter('disable_vm_nic_vdisks'),
		disableVNicProbe = g_probe.getParameter('disable_vm_nic_probe');

	// Support the old probe parameter to disable the VM probe
	if ('' + g_probe.getParameter('disable_vm_probe') == 'true')
		return false;

	// Copy VM specific parameters that need to be available to
	// sensors for triggered probes.
	if (disableVNics)
		parms.disable_vm_nic_vnics = disableVNics;
	if (disableVDisks)
		parms.disable_vm_nic_vdisks = disableVDisks;
	if (disableVNicProbe)
		parms.disable_vm_nic_probe = disableVNicProbe;

	parms.mor_ids = JSON.stringify(data.vm);
	return !!data.vm;
}
