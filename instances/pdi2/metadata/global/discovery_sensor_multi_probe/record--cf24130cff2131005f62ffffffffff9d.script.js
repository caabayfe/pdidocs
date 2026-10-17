function(result, ciData, debug, sensor) {
	new SnmpIdentityInfoParser(ciData).processNetscalerIdentityInfo(result);
}
