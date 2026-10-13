// parms: Object containing parameters to pass to
//        the probe being triggered.
// data:  Data provided by the sensor.
// return: true to trigger the probe
// This function is called by the VMs sensor.
// parms contains the known parameters for all vCenter
// probes: vcenter ID, datacenter ID, etc.
// data is an object containing one array:
//   vm: list of VMs being discovered
// This function is used to trigger the VM NIC
// probe.  It copies the list of VMs to
// parms.mor_ids and returns true to trigger the
// probe.
function(parms, data) {
	var vms,
		disableVNics = g_probe.getParameter('disable_vm_nic_vnics'),
		disableVDisks = g_probe.getParameter('disable_vm_nic_vdisks'),
		disableProbe = '' + g_probe.getParameter('disable_vm_nic_probe') == 'true',
		refreshState = '' + g_probe.getParameter('refresh_state') == 'true';

	// Copy parameters specific to the VM NIC probe
	if (disableVNics)
		parms.disable_vm_nic_vnics = disableVNics;
	if (disableVDisks)
		parms.disable_vm_nic_vdisks = disableVDisks;

	disableVNics = '' + disableVNics == 'true';
	disableVDisks = '' + disableVDisks == 'true';

	// Support the old probe parameter to disable the NIC probe.
	// Also support the refresh_state parameter.
	// Also don't trigger the NIC probe if we've disabled all the data
	// it gets.
	if (refreshState || disableProbe || (disableVNics && disableVDisks))
		return false;

	if(data.template)
		vms = data.vm.concat(data.template);
	else 
		vms = data.vm;
	parms.mor_ids = JSON.stringify(vms);
	
	return true;
}
