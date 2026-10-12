function /*boolean*/ authorizeSubscribe(/*String*/ channel, /*String*/ user) {
	// Kill switch for the DEF0874254 subscribe authorization check, in case of unforeseen regressions.
	if (gs.getProperty('glide.vtb.enforce_board_table_security', 'true') != 'true')
		return true;

	if (!channel)
		return false;

	var segments = channel.replace(/^\//, '').split('/');
	if (segments.length != 2 || segments[0] != 'vtb' || segments[1].indexOf('*') > -1)
		return false;

	var grBoard = new GlideRecord('vtb_board');
	if (!grBoard.get(segments[1]))
		return false;

	if (new VTBBoardSecurity().canUserAccess(grBoard, user))
		return true;

	// Mirror the vtb_board read ACL's admin_overrides=true (sys_security_acl 9cab3913eb2311001c13abf11206fe8f):
	// admins can already read any board via REST/GraphQL regardless of ownership/membership, so they must keep
	// getting live updates too.
	var grRole = new GlideRecord('sys_user_has_role');
	grRole.addQuery('user', user);
	grRole.addQuery('role.name', 'admin');
	grRole.addQuery('active', true);
	grRole.query();
	return grRole.hasNext();
}
