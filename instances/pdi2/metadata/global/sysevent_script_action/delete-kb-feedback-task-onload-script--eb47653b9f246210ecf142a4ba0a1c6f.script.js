var update = new GlideRecord("sys_update_xml");
update.addQuery("name", "sys_script_client_9e28542067401300d358bb2d07415a9f");
update.setLimit(1);
update.query();

if (update.next()) {
	gs.info("sys_script_client_9e28542067401300d358bb2d07415a9f.xml is customized. Skipped deleting the customized client script.");
} else {
	var id = "9e28542067401300d358bb2d07415a9f";
	var gr = new GlideRecord("sys_script_client");

	if (gr.get(id)) {
		gr.deleteRecord(id);
		gs.info("kb_feedback_task onload client script with sys_id {0} deleted", id);
	}
	else {
		gs.info("kb_feedback_task onload client script with sys_id {0} not found, already deleted", id);
	}
}
