function(ciData, debug, sensor) {
	if (JSUtil.notNil(related_data.macTable)) {
		sensor.forwardingTable = related_data.macTable;
	}
}
