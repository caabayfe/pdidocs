action.setRedirectURL(current);
var name = current.file_name + "";
var payload = current.payload;
var updateManager = new GlideUpdateManager2();
var updateSet = new GlideUpdateSet();				
var updateSetId = updateSet.getOrCreate();
updateManager.loadXML(current.payload, true, null, "sys_update_set", updateSetId);
var grHead = GlideappUpdateVersion.getHeadVersion(name);
if (grHead.isValidRecord()) {
	var gr = new GlideRecord("sys_update_xml");
    gr.payload = payload;
	gr.name = name;
	gr.update_set = updateSetId;
	gr.category = "customer";
	gr.type = current.type;
	gr.target_name = current.target_name;
	gr.action = grHead.action;
	gr.application = grHead.application;
	gr.insert();
}	
// TODO verify that there's a sys_update_xml when we're done for the customization

current.disposition = "4";

var grBaselineHead = GlideappUpdateVersion.getVersion(name, current.upgrade_history, "sys_upgrade_history", null);
if (grBaselineHead.isValidRecord()) {
	current.payload = grBaselineHead.payload;
}
current.update();
gs.cacheFlush();
