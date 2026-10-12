(function process(/*ResolverEnvironment*/ env) {

	var userId = gs.getUserID();
	var presence = new GlideRecord('sys_user_presence');
	presence.get('user', userId);
	
	return presence;

})(env);
