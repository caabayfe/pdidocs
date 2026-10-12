function onLoad() {
	// List of applicable probes in alphabetical order
	var probes = { 
		'discovery_aws_probe':'AWS Probe', 
		'discovery_probes_cim':'CIM Probe', 
		'discovery_probes_multi':'MultiProbe', 
		'discovery_probes':'Probe', 
		'discovery_probes_snmp':'SNMP Probe', 
		'discovery_probes_wmi':'WMI Probe'
	};

	// Care for only those probes in the above list
	if (!probes[g_form.getTableName()])
		return;

	// Clear the choice list
	g_form.clearOptions('sys_class_name');
	
	for (var probe in probes)
		g_form.addOption('sys_class_name', probe, probes[probe]);

	g_form.setValue('sys_class_name', g_form.getTableName(), probes[g_form.getTableName()]);
}
