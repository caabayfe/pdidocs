updateSmAccess();

function updateSmAccess() {
	var pm = new GlidePluginManager();
    if (pm.isZboot())
        return;
    var ob = new GlideRecord("sys_db_object");
    ob.addQuery("name", "sn_sm_secret");
    ob.query();
    if (ob.next()) {
        ob.create_access = "false";
        ob.delete_access = "false";
        ob.update_access = "false";
        ob.ws_access = "false";
        ob.alter_access = "false";
        ob.actions_access = "false";
        ob.client_scripts_access = "false";
        ob.setWorkflow(false);
        ob.update();
        gs.log("Updated sn_sm_secret table's application access. ");
        return;
    }
    gs.log("Table sn_sm_secret does not exist.");
}
