var ldap = new GlideLDAPUsers();
ldap.load(current.user_name.toString());
action.setRedirectURL(current);
gs.addInfoMessage(gs.getMessage("Reload of LDAP data for {0} has been started",current.name));
