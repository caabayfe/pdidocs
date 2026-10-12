/**
 Service-now.com

 Description:  Restarts LDAP listener on password change to refresh MID cache
**/ 
(function executeRule(current, previous /*null when async*/) {
	
	gs.addInfoMessage(gs.getMessage("Restarting LDAP listener"));
	gs.include("LDAPUtils");
	var ldapUtils = new LDAPUtils();
	gs.info("Stopping LDAP listener.");
	ldapUtils.stopListener(current);
	gs.info("Starting LDAP listener.");
	ldapUtils.startListener(current);
	gs.info("LDAP listener restart completed.");

})(current, previous);
