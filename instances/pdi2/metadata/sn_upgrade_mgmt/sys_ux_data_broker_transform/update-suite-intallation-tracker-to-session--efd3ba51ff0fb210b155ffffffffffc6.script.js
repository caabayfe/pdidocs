function transform(input) {
	const upgradeSessionId = input.upgrade_session_id;
	const tracker_id = input.tracker_id;
	const gr = new GlideRecord("sn_um_upgrade_sessions");
	gr.get(upgradeSessionId);
	gr.setValue("suite_install_execution_tracker", tracker_id);
	gr.update();
}
