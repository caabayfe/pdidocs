var updateGR = new GlideRecord('sys_update');
updateGR.addQuery('name', 'marker_com_snc_iam');
updateGR.query();

if (updateGR.next()) {
	// Marker present - Update the active state of ACL	
	var aclGR = new GlideRecord('sys_security_acl');
	aclGR.addQuery('sys_id', 'IN', '5f969f1cc7241010c24ae122c7c26044,a14e424ec7101010c24ae122c7c26055');
	aclGR.addQuery('active', false);
	aclGR.query();

	while (aclGR.next()) {
		aclGR.setValue('active', true);
		aclGR.update();
	}

	// Delete marker
	updateGR.deleteRecord();
}
