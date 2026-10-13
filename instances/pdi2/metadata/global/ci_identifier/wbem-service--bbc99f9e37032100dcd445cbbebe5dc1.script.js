function(ciData, log, identifier) {
	if (gs.nil(ciData.data.cim_object_path))
		return new CIIdentifierResult([], false, true); // nothing to identify against
	
	var gr = new GlideRecord('cmdb_ci_wbem_service');
	gr.addQuery('cim_object_path', ciData.data.cim_object_path);
	gr.query();
	
	var matches = [];
	while (gr.next())
		matches.push(''+gr.sys_id);
	
	return new CIIdentifierResult(matches, true, true); // is matchable and terminates identification process afters
}
