function goBack() {
    window.history.back();
}

addLoadEvent(function(){
	showWebAuthenticationFactors();
});

function showWebAuthenticationFactors(){
	var isWebAuthnSupportedByClient  =  (!window.PublicKeyCredential) ? "false" : true;
	if(gel("builtInAuthenticatorDiv")){
		gel("builtInAuthenticatorDiv").style.display = isWebAuthnSupportedByClient == true ? "block" : "none";
		gel("roamingAuthenticatorDiv").style.display = isWebAuthnSupportedByClient == true ? "block" : "none";
	}
}

function openTotpSetupDialog(){
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('google_auth_setup_dialog', false, 650, 350);
	gDialog.setTitle(new GwtMessage().getMessage("Complete the steps below to enable multi-factor authentication"));
	gDialog.setPreference('focusTrap', true);
	gDialog.render();
}

function openTotpSetupChangeDialog(){
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('google_auth_setup_dialog', false, 650, 350);
	gDialog.setTitle(new GwtMessage().getMessage("Change authenticator code"));
	gDialog.setPreference('focusTrap', true);
	gDialog.render();
}

function openAuthenticatorKeySetupDialog(){
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('webauthn_roaming_authenticator_registration', false, 650, 350);
	gDialog.setTitle(new GwtMessage().getMessage("Register security key or passkey"));
	gDialog.setPreference('focusTrap', true);
	gDialog.render();
}

function openInternalAuthenticatorSetupDialog(){
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('webauthn_register_internal_authenticator', false, 650, 350);
	gDialog.setTitle(new GwtMessage().getMessage("Register Biometric authenticator"));
	gDialog.setPreference('focusTrap', true);
	gDialog.render();
}

function openManageAuthenticator(sys_id, type){
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('webauthn_manage_authenticator', false, 650, 350);
	gDialog.setTitle(new GwtMessage().getMessage("Manage Authenticator"));
	gDialog.setPreference("authenticator_sys_id", sys_id);
	gDialog.setPreference("authenticator_type", type);
	gDialog.setPreference('focusTrap', true);
	gDialog.render();
}


function doesClientSupportWebAuthn(){
	if (!window.PublicKeyCredential){
		return false;
	}
	return true;
}

function disableMfa() {
	var areYouSure = confirm(new GwtMessage().getMessage("Are you sure you want to disable Multi-factor authentication ?"));
	if(areYouSure == true){
		var ajax = new GlideAjax("GlideMultifactorAuthenticator");
		ajax.addParam("sysparm_name", "disableMFA");
		ajax.getXML(this.forgetAllRememberedBrowsersCallAndReload.bind(this));
	}
}

function forgetAllRememberedBrowsers() {
	var areYouSure = confirm(new GwtMessage().getMessage("Are you sure you want to forget all remembered browsers ?"));
	if(areYouSure == true) {
		forgetAllRememberedBrowsersCall();
		gel("divNotificationMain").style.display = "block";
		
gel("divNotificationMain").innerHTML = new GwtMessage().getMessage("The remembered browsers have been removed from the system. You will be prompted for MFA on next login.") + "<button class='btn-icon close icon-cross' onclick=hideNotification(); style='min-width: 2.5em; min-height:1.75em; line-height: normal;'></button>";
	}
}

function forgetAllRememberedBrowsersCallAndReload(response) {
	var ajax = new GlideAjax("GlideMultifactorAuthenticator");
	ajax.addParam("sysparm_name", "forgetAllRememberedBrowsers");
	ajax.getXML(this.reload.bind(this));
		
}

function reload (response){
	window.location.reload();
}

function forgetAllRememberedBrowsersCall() {
	var ajax = new GlideAjax("GlideMultifactorAuthenticator");
	ajax.addParam("sysparm_name", "forgetAllRememberedBrowsers");
	ajax.getXML();
}

function hideNotification(){
	gel("divNotificationMain").style.display = "none";
	window.location.reload();
}
