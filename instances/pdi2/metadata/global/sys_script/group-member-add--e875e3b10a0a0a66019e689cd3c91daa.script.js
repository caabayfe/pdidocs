// when a user is added to a group
// user gets all inherited roles from that group
if (!GlideProperties.getBoolean('glide.role_management.use.inh_count', false) || !pm.isActive('com.glide.role_management.inh_count')) {
	var roles = new GlideRecord('sys_group_has_role'); 
	roles.addQuery('group', current.group);
	roles.addQuery('inherits', true);
	roles.query(); 
	while (roles.next()) {
		gs.addInfoMessage(gs.getMessage("Granting role") + ": " + roles.role.name + " = " + roles.inherits);
		var role = new GlideRecord('sys_user_has_role'); 
		role.initialize();
		role.role = roles.role; 
		role.user = current.user; 
		role.granted_by = current.group; 
		role.inherited = roles.inherits;    
		role.insert();
	}	
}

if (GlidePluginManager.isRegistered('com.glide.domain')) {
    gs.include("DomainManager");
    var dm = new DomainManager(); 
    dm.groupMemberAdd(current);
}
