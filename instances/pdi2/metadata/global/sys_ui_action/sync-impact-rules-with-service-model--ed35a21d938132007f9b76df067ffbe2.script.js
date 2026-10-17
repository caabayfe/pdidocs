gs.log("*** Synching Impact rules for Business Service id=" + current.sys_id + " with Service Model ***");
var impactManager = new SNC.ImpactManager();
impactManager.importRulesFromBackupAfterModelCrush(current.sys_id);
gs.log ("*** Done synching Impact rules for Business Service id=" + current.sys_id + " with Service Model ***");

var uri = action.getGlideURI() + "";
if (uri.indexOf("_list.do") == -1) {
	action.setRedirectURL(current);
}
