var connectionType = parent.connection_type;
var uri = action.getGlideURI();
action.setRedirectURL(uri.toString(connectionType+'.do'));
