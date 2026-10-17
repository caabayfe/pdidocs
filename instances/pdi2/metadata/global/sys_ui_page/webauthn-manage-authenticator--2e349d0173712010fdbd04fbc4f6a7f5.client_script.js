function closeDialog() {
	GlideDialogWindow.get().destroy();
	window.location.reload();
}

function removeAuthenticator() {
	var areYouSure = confirm(new GwtMessage().getMessage("Are you sure you want to remove the authenticator ?"));
	if(areYouSure == true) {
		var ajax = new GlideAjax("WebAuthentication");
		ajax.addParam("sysparm_name", "removeAuthenticator");
		ajax.addParam("sysparm_sys_id", GlideDialogWindow.get().getPreference('authenticator_sys_id'));
		ajax.getXML(this.closeDialog.bind());
	}
}
