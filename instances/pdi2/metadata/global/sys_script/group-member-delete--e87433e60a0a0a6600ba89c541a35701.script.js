// delete all the roles the user had granted from this group
if (!GlideProperties.getBoolean('glide.role_management.use.inh_count', false) || !pm.isActive('com.glide.role_management.inh_count')) {
	var gr = new GlideRecord('sys_user_has_role');
	gr.initialize(); 
	gr.addQuery('granted_by', current.group);
	gr.addQuery('inherited', true);
	gr.addQuery('user', current.user);
	gr.deleteMultiple();
	gs.addInfoMessage(current.group.name + ' ' + gs.getMessage('group roles removed from') + ' ' + current.user.name);
}

if (GlidePluginManager.isRegistered('com.glide.domain')) {
   gs.include("DomainManager");
   var dm = new DomainManager(); 
   dm.groupMemberDelete(current);
}
