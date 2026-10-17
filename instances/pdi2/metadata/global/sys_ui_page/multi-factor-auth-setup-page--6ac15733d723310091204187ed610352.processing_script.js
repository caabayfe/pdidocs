gs.getSession().getHttpSession().setAttribute("selectedMfaFactor", sys_selected_mfa_factor);
var isSessionAccessReducedMessageShown = GlideSession.get().getBooleanProperty("isSessionAccessReducedMessageShown", false);
if (isSessionAccessReducedMessageShown)
    GlideSession.get().putProperty("isSessionAccessReducedMessageShown", false);
if (hdnBypassSetup == "true")
    SNC.MultifactorAuthUtil.bypassSetup();
else if (GlideSession.get().getProperty('web_authn_registration_successful')) {
    SNC.MultifactorAuthUtil.loginUser();
    SNC.SecurityEventSender.sendMultifactorAuthEventData("multifactor.auth.setup.success", null, null, false);
    SNC.SecurityEventSender.sendMfaGCFEvent("setup", "success", "fido");
}else if ( SNC.MultifactorAuthUtil.validateOneTimeCodeForEmailAndSMSFactors()) {
    SNC.MultifactorAuthUtil.loginUser();
    SNC.SecurityEventSender.sendMultifactorAuthEventData("multifactor.auth.setup.success", null, null, false);
    SNC.SecurityEventSender.sendMfaGCFEvent("setup", "success", "email");
}else if (SNC.MultifactorAuthUtil.isResponseValid(txtResponse)) {
    SNC.MultifactorAuthUtil.loginUser();
    SNC.SecurityEventSender.sendMultifactorAuthEventData("multifactor.auth.setup.success", null, null, false);
    SNC.SecurityEventSender.sendMfaGCFEvent("setup", "success", "totp");
} else {
    gs.addErrorMessage(gs.getMessage("Your Passcode is incorrect. Please try again with a correct code."));
    gs.logWarning("Response from the authenticator app entered by the user is invalid!");
}
