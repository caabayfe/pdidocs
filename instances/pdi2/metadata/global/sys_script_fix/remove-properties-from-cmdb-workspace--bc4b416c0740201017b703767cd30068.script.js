var logName = "CMDB Workspace Fix";
var props = new GlideRecord("sys_properties");
var deleteCount = 0;
// 230016d573131300ee4dd3c72bf6a7cd sys_id is the identifier for CMDB Workspace application
props.addEncodedQuery("nameSTARTSWITHglide.ui.^nameENDSWITH_activity.fields^sys_scope=230016d573131300ee4dd3c72bf6a7cd");
props.query();
gs.log("Found " + props.getRowCount() + " sys_properties records in CMDB Workspace scope", logName);
while (props.next()) {
	var testIsCustomized = new GlideRecord("sys_properties");
	testIsCustomized.get(props.getValue("sys_id"));
	if (!sn_collision.CollisionAPI.willBeReplacedOnUpgrade(testIsCustomized)) {
		gs.log(props.getValue("name") + " has been customized and will not be removed", logName);
		continue;
	}
	if (!props.deleteRecord()) {
		gs.logError("Failure deleting sys_property record for: " + name, logName);
		continue;
	}
	deleteCount++;
}
gs.log("Successfully deleted " + deleteCount + " CMDB Workspace sys_properties records", logName);
