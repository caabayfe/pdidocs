(function process(/*ResolverEnvironment*/ env) {
	
	var encryptionContexts = [];
	
	if (!GlidePluginManager.isActive('com.glide.encryption'))
		return encryptionContexts;

	// Dynamic role relgation dependency changes - replacing db call for with security APIs to get roles of logged in user
	var currentUserRoles = gs.getUser().getRoles(); 
    var userId = gs.getUserID();
	var gr = new GlideRecord('sys_user_has_role');
	gr.addQuery('user', userId);
	gr.addQuery('role.name', 'IN', currentUserRoles); // passing subset of roles we got from security API gs.getUser().getRoles()
	gr.addNotNullQuery('role.encryption_context');
	gr.query();
	
	while (gr.next()) {
		var context = {
			name: gr.role.encryption_context.name.toString(),
			sysId: gr.role.encryption_context.toString()
		};
		
		var push = true;
		encryptionContexts.forEach(function(encryptionContext) {
			if (encryptionContext.sysId === context.sysId) {
				push = false;
				return;
			}
		});
		
		if (push)
			encryptionContexts.push(context);
	}
	
	return encryptionContexts;
})(env);
