var utils = new ServiceMappingUtils();
gs.log("*** Synching Business Service id=" + current.sys_id + " with Service Model ***");
utils.resetModel(current);
gs.log ("*** Done synching Business Service id=" + current.sys_id + " with Service Model ***");

var uri = action.getGlideURI() + "";
if (uri.indexOf("_list.do") == -1) {
	action.setRedirectURL(current);
}
