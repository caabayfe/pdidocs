function openMuteReasonDialog() {
	var dialogWindow = new GlideModal('select_mute_reason');
	dialogWindow.setTitle(new GwtMessage().getMessage('Select Mute Reason'));
	if (typeof g_list != 'undefined') {
		sysIdList = g_list.getChecked();
	} else {
		sysIdList = g_form.getUniqueValue();
	}
	dialogWindow.setPreference('sysparm_obj_list', sysIdList);
	dialogWindow.setWidth(500);
	dialogWindow.setPreference("focusTrap", true);
	dialogWindow.render();
}
