function(ciData, debug, sensor) {
	sensor.connections = related_data.connections;
	if (!related_data.isValid)
		sensor.processWarning(related_data.error_string);
}
