(function (finding, current) {
   
	/**
	* Query the Group Type table to get the sys_id for `security incident` Type value
	* Query for User Groups that have the `sn_si.analyst` role, but not the `security incident` Type
	* Create finding for each User Group that has `sn_si.analyst` role, but does not have `security incident` Type
	*/
	var hsdGrp = new GlideRecord('sys_group_has_role');
	hsdGrp.addQuery('role.name', 'sn_si.analyst');
	hsdGrp.addQuery('group.type', 'DOES NOT CONTAIN', current.sys_id);
	hsdGrp.query();
	while (hsdGrp.next()) {
		finding.setCurrentSource(hsdGrp);
		finding.increment();
	}

})(finding, current);
