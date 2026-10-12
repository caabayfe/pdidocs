(function refineQuery(current, parent) {		
	var assocSysIds = [];
	var assocRolesView = new GlideRecord('license_details_assoc_roles');
	assocRolesView.addEncodedQuery('cti_license=' + parent.sys_id + '^ORlhf_license=' + parent.sys_id);
	assocRolesView.query();
	while (assocRolesView.next())
		assocSysIds.push(assocRolesView.getValue('lr_sys_id').toString());
	
	current.addQuery('sys_id', 'IN', assocSysIds);
	current.orderBy('name');

})(current, parent);
