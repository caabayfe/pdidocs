(function refineQuery(current, parent) {

	current.addQuery('name', 'DOES NOT CONTAIN', 'mid.limited.resource.');

	var qc = current.addQuery('ecc_agent', parent.sys_id);
	
//	qc.addOrCondition('ecc_agent', null);
})(current, parent);
