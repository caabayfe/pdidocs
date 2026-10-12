var ldap = new LDAPUtils();
if (ldap.refreshGroup(current.name.toString()))
    gs.addInfoMessage(gs.getMessage("Reload of LDAP data for {0} has been started",[GlideStringUtil.escapeHTML(current.name)])); 
else
    gs.addInfoMessage(gs.getMessage("Group {0} could not be found in LDAP",[GlideStringUtil.escapeHTML(current.name)]));

action.setRedirectURL(current);
