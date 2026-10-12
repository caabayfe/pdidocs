function reset() {  
	var bodyMessage = getMessage('Resetting to the default option updates the defined consent policies for all countries.');
	var bodyMessage2 = getMessage('Are you sure you want to reset the default policies for all countries?');
	var bodyMessage3 = getMessage('Yes, I agree to proceed with the reset.');
	var okText = getMessage('Reset');

    var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('consent_policy_form_confirmation');
    dlg.setTitle(new GwtMessage().getMessage('Reset Default Consent Policies to All Countries'));
    dlg.setWidth(450);
    dlg.setPreference('sysparm_body_message', bodyMessage);
    dlg.setPreference('sysparm_body_message_2', bodyMessage2);
    dlg.setPreference('sysparm_body_message_3', bodyMessage3);
    dlg.setPreference('sysparm_ok_text', okText);
    dlg.setPreference('sysparm_parent_form', this);
    dlg.render();
}
