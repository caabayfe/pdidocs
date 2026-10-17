var utils = new ServiceMappingUtils();
gs.log("*** Removing Business Service id=" + current.sys_id + " from Service Model ***");
utils.removeFromModel(current);
gs.log("*** Done removing Business Service id=" + current.sys_id + " from Service Model ***");

var uri = action.getGlideURI() + "";
if (uri.indexOf("_list.do") == -1) {
	action.setRedirectURL(current);
}
