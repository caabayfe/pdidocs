function transform(input) {
	// return "def4900a63f02210a6247b61d37141cf";
	var upgrade_plan_sysid = input.state.upgrade_plan_sysid;
	var upgrade_session_id = input.state.upgrade_session_id;
	var first_load = input.state.first_load;

    gs.info("Called with upgrade plan sysID " + upgrade_plan_sysid);


    var gr = new GlideRecord('sn_um_upgrade_sessions');

    if (first_load === true) {
        if (gr.get(upgrade_session_id)) {
            gs.info('Record already exists for first_load with sys_id: ' + upgrade_session_id + ' returning - ' + gr.getValue("process_upgrade_plan_execution_tracker"));
            return gr.getValue("process_upgrade_plan_execution_tracker"); 
        }
        return "";
    }

	var trackerID = new sn_upgrade_mgmt.StoreAppsFlowUtils().processUpgradePlan(upgrade_plan_sysid);
    if (gr.get(upgrade_session_id)) {
        gr.process_upgrade_plan_execution_tracker = trackerID;
        gr.update();
        gs.info('Record with sys_id ' + upgrade_session_id + ' updated successfully.');
    } else {
        gs.error('No record found with sys_id: ' + upgrade_session_id);
    }
    return trackerID;
}
