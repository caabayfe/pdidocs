(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var licFamilyUtils = new LicFamilyUtils();
	var assocRoleSysIDList = licFamilyUtils.getAssocRoleSysIDs(parent.lineage_id);

	//Display the pluginID, family name, role name
	current.addQuery('sys_id', 'IN', assocRoleSysIDList);
	current.orderBy('fmly_lineage_name');
	current.orderBy('role_name');

})(current, parent);
