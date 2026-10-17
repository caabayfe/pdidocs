// parms: Object containing parameters to pass to
//        the probe being triggered.
// data:  Data provided by the sensor.
// return: true to trigger the probe
// This function is called by the VMs sensor.
// parms contains the known parameters for all vCenter
// probes: vcenter ID, datacenter ID, etc.
// data is an object containing one array:
//   vm: list of VMs being discovered
// This function is used to trigger the VM Tags
// probe.  It copies the list of VMs to
// parms.mor_ids and returns true to trigger the
// probe.
function(parms, data) {
	var vCenterSysID = (g_probe.getParameter('vcenter_sys_id') || '') + '';
	
	//Tags discovery for the VMs would work only for the vCenter 6.0 and above
	if (vCenterSysID) {
		var gr = new GlideRecord('cmdb_ci_vcenter');
		gr.get('sys_id', vCenterSysID)
		
		if (gr && gr.getValue('api_version')) {
			var apiVersion = (gr.getValue('api_version')).split('.');
			if (apiVersion 
				&& apiVersion.length 
				&& Packages.java.lang.Integer.parseInt(apiVersion[0]) < 6)
				return false;
		}
	
		//If Tags property is disabled then don't discover tags
		if (g_probe.getParameter('disable_vm_tags_probe') + '' == 'true')
			return false;

		var vms = data.vm.concat(data.template);
		parms.mor_ids = JSON.stringify(vms);
	
		return true;
	}
	else 
		// Tags are not applicable for ESX discovery
		return false;  
}
