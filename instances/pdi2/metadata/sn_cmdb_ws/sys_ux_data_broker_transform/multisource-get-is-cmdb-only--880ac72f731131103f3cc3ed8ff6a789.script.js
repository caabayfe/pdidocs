function transform(input) {
	var isCmdbOnly = gs.getProperty('sn_cmdb_ws.ms.calculate_cmdb_only', false);
	if (isCmdbOnly == 'true')
		return true;
	return false;
}
