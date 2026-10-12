function extendEnforcementClient() {
	var list = GlideList2.get('sys_user_basic_auth_exception');
	list.submit({sys_action: 'extendEnforcementServer'});
}
