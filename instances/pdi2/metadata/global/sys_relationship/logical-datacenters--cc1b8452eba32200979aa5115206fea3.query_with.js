(function refineQuery(current, parent) {
	var ldcList = [];
	var relGr = new GlideRecord('cmdb_rel_ci');
	// filter for hosted on relationship
	relGr.addQuery('type', '5f985e0ec0a8010e00a9714f2a172815');
	// filter for LDCs hosted on service account
	relGr.addQuery('child', parent.sys_id + '');
	relGr.query();
	while (relGr.next()) {
		ldcList.push(relGr.getValue('parent'));
	}
	current.addQuery('sys_id', ldcList);
})(current, parent);
