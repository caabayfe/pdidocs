function onLoad() {
	// List of applicable sensors in alphabetical order
	var sensors = {
		'discovery_sensor_multi':'MultiSensor',
		'discovery_sensor':'Sensor'
	};
	
	// Care for only those sensors in the above list
	if (!sensors[g_form.getTableName()])
		return;
	
    // Clear the choice list
	g_form.clearOptions('sys_class_name');
	
	for (var sensor in sensors)
		g_form.addOption('sys_class_name', sensor, sensors[sensor]);
	
	g_form.setValue('sys_class_name', g_form.getTableName(), sensors[g_form.getTableName()]);
}
