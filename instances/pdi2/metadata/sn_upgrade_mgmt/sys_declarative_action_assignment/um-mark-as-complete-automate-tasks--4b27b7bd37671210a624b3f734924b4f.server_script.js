try {
    var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
	upgradeSessionGR.addQuery("status", "in_progress");
	upgradeSessionGR.orderByDesc("sys_created_on");
    upgradeSessionGR.query();
    
    while (upgradeSessionGR.next()) {

		var gr = new GlideRecord("sn_um_upgrade_session_config");
		gr.get("upgrade_session_id", upgradeSessionGR.getValue("sys_id"));
		gr.orderByDesc("sys_created_on");
		gr.query();
		var count = 0;
		while(gr.next() && count < 5) {
			count++;
			// gs.info(gr.getValue("setting_key") + " -- " + gr.getValue("setting_value"));
			if(gr.getValue("setting_key") === "enable_upgrade_agent_assist" && gr.getValue("setting_value") == true){
				// perform whatever
				// gs.info("enable_upgrade_agent_assist is true");
				continue;
			}
			if(gr.getValue("setting_key") === "auto_schedule_and_schema_alters" && gr.getValue("setting_value") == true){
				// perform whatever
				// gs.info("auto_schedule_and_schema_alters is true");
				continue;
			}
			if(gr.getValue("setting_key") === "generate_atf_tests" && gr.getValue("setting_value") == true){
				// perform whatever
				// gs.info("generate_atf_tests is true");
				continue;
			}
			if(gr.getValue("setting_key") === "auto_assign_skipped_records" && gr.getValue("setting_value") == true){
				// perform whatever
				// gs.info("auto_assign_skipped_records is true");
				continue;
			}
			if(gr.getValue("setting_key") === "upgrade_store_apps_to_latest" && gr.getValue("setting_value") == true){
				// perform whatever
				// gs.info("upgrade_store_apps_to_latest is true");
				continue;
			}
		}
	}
	current.state = "COMPLETE";
	current.update();

} catch (e) {
    gs.error("Error marking automate upgrade tasks as complete -  " + e);
}
