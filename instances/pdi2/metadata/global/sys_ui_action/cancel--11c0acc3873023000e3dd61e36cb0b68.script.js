function onModalCancel() {
	var view = g_form.getViewName();
	if(parent.name != "gsft_main" && (parent.$j.find("#" + view).length == 0)) {
		g_form.addErrorMessage(getMessage("Action not available here"));
		return;
	}
	parent.g_form.setValue("state", g_scratchpad.originalState);
	parent.g_form.setValue("resolution_code", g_scratchpad.originalResolutionCode);
	var modalId = g_form.getViewName();
	parent.GlideModal.prototype.get(modalId).destroy();
}
