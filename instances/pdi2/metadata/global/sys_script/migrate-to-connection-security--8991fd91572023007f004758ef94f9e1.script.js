(function executeRule(current, previous /*null when async*/) {
	if (current.connection_security.changes())
		return;
	
	var emailAccountSecurity = new EmailAccountSecurity();
	emailAccountSecurity.migrate(current);

})(current, previous);
