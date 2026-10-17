if(GlideProperties.get("glide.sys.domain.partitioning", 'false') =='true'){
	//removing the acls
	var evt_mgmt_admin='600be631eb12110045e1a5115206fe38';
	var evt_mgmt_operator='c688e08293b00200725d3b5b357ffb8e';
	var flow_operator_role='36e3325dcb623200a30bb895634c9c4f';
	var userRolesGR = new GlideRecord('sys_user_role_contains'); 
	userRolesGR.addQuery('role','IN', evt_mgmt_admin+','+evt_mgmt_operator);
	userRolesGR.addQuery('contains','=', flow_operator_role);
	userRolesGR.query();
	while(userRolesGR.next()) { 
		  userRolesGR.deleteRecord();
	}
	gs.log('Deleted flow designer roles for domain separation successfully');
}
