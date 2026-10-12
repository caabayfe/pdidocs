var maxDeviceCount = 0;
function goBack() {
    window.history.back();
}

function openManageDeviceRegistration(sys_id){
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('manage_device_registration_record', false, 450, 350);
	gDialog.setTitle(new GwtMessage().getMessage("Confirmation"));
	gDialog.setPreference("device_sys_id", sys_id);
	gDialog.setPreference('focusTrap', true);
	gDialog.render();
}

function openDeviceRegistrationSetupDialog() {
	maxDeviceCount = $[jvar_maxDeviceCount]; 
    var registeredDevice = $[jvar_deviceCount];
	
    if (registeredDevice >= maxDeviceCount) {
        var ErrorMsg = new GwtMessage().getMessage('You have already registered the maximum number of trusted devices. To register a new device, delete one of the existing devices.');
        new GlideForm().addErrorMessage(ErrorMsg);
    } else {
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        var gDialog = new dialogClass('qrcode_setup_dialog_mobile', false, 500, 250);
        gDialog.setBackdropStatic(true);
        gDialog.setTitle(new GwtMessage().getMessage("Register Trusted Device"));
        gDialog.setPreference('focusTrap', true);
        gDialog.render();
    }
}

function reload (response){
	window.location.reload();
}

function hideNotification(){
	gel("divNotificationMain").style.display = "none";
	window.location.reload();
}
