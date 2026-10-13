function(ciData, debug, sensor) {
	sensor.running_processes = related_data.running_processes;
	if (related_data.error_msg)
		sensor.processWarning(related_data.error_msg);
}
