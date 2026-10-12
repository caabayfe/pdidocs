// Set listener field to false to indicate the user does not want the listener
current.listener = false;
current.update();

gs.include("LDAPUtils");
var ldapUtils = new LDAPUtils();
ldapUtils.stopListener(current);

// Redirect to Server Definition
action.setRedirectURL(current);
