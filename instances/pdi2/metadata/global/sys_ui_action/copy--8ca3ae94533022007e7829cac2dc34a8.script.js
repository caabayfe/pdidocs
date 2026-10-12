copyConfig();
function copyConfig() {
	var stepConfig = new sn_atf.StepConfig(current);
	try {
		var copiedConfigId = stepConfig.copy(current.sys_id);

		var uiNotification = new UINotification();
		uiNotification.setText(gs.getMessage("Successfully copied the step config"));
		uiNotification.send();

		var gr = new GlideRecord("sys_atf_step_config");
		gr.get(copiedConfigId);
		action.setRedirectURL(gr);
	} catch (ex) {
		action.setRedirectURL(current);
		gs.addErrorMessage(gs.getMessage("Unexpected error occurred while copying the step config: {0}", ex.message));
	}
}
