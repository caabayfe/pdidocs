function(ciData, log, identifier) {
	if (gs.nil(ciData.data.fabric_id))
		return new CIIdentifierResult([], false, true); // nothing to identify against
	
	var gr = new GlideRecord('cmdb_ci_san_fabric');
	gr.addQuery('fabric_id', ciData.data.fabric_id);
	gr.query();
	
	var matches = [];
	while (gr.next())
		matches.push(''+gr.sys_id);
	
	return new CIIdentifierResult(matches, true, true); // is matchable and terminates identification process afters
}
