var b = GlideContextualSecurityManager.autoCreateReadFieldAcl(current);
if (b && typeof g_suppress_acl_creation_msg == 'undefined') {
	var parts = ('' + current.name).split('.');
	var tbl = parts[0];
	gs.addInfoMessage(gs.getMessage('Read {0}.* ACL automatically created', tbl));
}
