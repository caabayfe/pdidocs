//Apply the LDAP changes from the MID server

var ldapConfig = GlideLDAPConfig.get(current.source);
var processed = ldapConfig.processMidServerListenerChanges(current.sys_id);
current.state = 'processed';
current.processed = gs.nowDateTime();
if (!processed) {
	current.error_string = 'WARNING: change was not applied as a result of listener not running';
}
current.update();
