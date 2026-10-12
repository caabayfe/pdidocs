function closeDialog() {
	GlideDialogWindow.get().destroy();
	window.location.reload();
}

function removeDeviceRegistration() {
		var ajax = new GlideAjax("GlideDeviceRegistration");
		ajax.addParam("sysparm_name", "removeDeviceRegistration");
		ajax.addParam("sysparm_sys_id", GlideDialogWindow.get().getPreference('device_sys_id'));
		ajax.getXML(this.closeDialog.bind());
	}
