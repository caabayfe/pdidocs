var uri = action.getGlideURI();
var table = uri.get('sysparm_collection');
var id = uri.get('sysparm_collectionID');
new GlideHistorySet(table, id).refresh();
gs.addInfoMessage(gs.getMessage("History has been refreshed"));
uri.set("sys_id", id);
action.setRedirectURL(uri.toString(table + ".do"));
