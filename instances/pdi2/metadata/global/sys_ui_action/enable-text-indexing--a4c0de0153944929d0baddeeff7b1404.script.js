var admin = new GlideTSTextSearchAdmin();
var result = admin.enableTextSearch(current.table);
gs.addInfoMessage(result);
action.setRedirectURL(current);
