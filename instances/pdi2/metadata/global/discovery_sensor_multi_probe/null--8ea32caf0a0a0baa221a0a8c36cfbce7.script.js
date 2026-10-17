function(ciData, debug, sensor) {
	var adapters = related_data.adapters;

    if (gs.nil(adapters))
        return;

	if (JSUtil.notNil(related_data.default_gateway))
		ciData.data.default_gateway = related_data.default_gateway;

    sensor.addToCIData(adapters);
}
