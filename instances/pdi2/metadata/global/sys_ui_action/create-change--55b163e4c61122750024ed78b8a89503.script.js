var change = new GlideRecord("change_request");
change.short_description = current.short_description;
change.description = current.description;
change.cmdb_ci = current.cmdb_ci;
change.priority = current.priority;
var sysID = change.insert();

current.rfc = sysID;
var mySysID = current.update();
gs.addInfoMessage(gs.getMessage("Change {0} created", change.number));
action.setRedirectURL(change);
action.setReturnURL(current);
