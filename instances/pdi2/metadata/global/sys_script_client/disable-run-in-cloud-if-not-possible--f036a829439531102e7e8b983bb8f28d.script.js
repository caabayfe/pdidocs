function onLoad() {

	// Check if Cloud Runner field should be disabled
	if (g_scratchpad.disableRunInCloud) {
		g_form.setDisabled('run_in_cloud', true);

	}
}
