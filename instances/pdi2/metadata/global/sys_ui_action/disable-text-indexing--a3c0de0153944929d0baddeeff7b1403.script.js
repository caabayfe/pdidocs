var admin = new GlideTSTextSearchAdmin();
var result = admin.disableTextSearch(current.table);
gs.addInfoMessage(result);
action.setRedirectURL(current);
