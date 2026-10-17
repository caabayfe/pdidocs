function apply() {    
	var sysId = "";
	var name = "";
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	var gr = new GlideRecord("sys_analytics_consent_policy");
	if (gr.get(sysId)) {
		name = gr.name + "";
	}
	var policyName = name;
	var bodyMessage = new GwtMessage().getMessage('You are about to apply the {0} policy to all countries. This selection overrides any previously assigned policy.', policyName);
	var bodyMessage2 = new GwtMessage().getMessage('Are you sure you want to apply {0} policy to All countries?', policyName);
	var bodyMessage3 = getMessage('Yes, I agree.');
	var okText = getMessage('Apply');

    var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('consent_policy_form_confirmation');
    dlg.setTitle(new GwtMessage().getMessage('Apply {0} Policy to All Countries', policyName));
    dlg.setWidth(450);
    dlg.setPreference('sysparm_body_message', bodyMessage);
    dlg.setPreference('sysparm_body_message_2', bodyMessage2);
    dlg.setPreference('sysparm_body_message_3', bodyMessage3);
    dlg.setPreference('sysparm_ok_text', okText);
	dlg.setPreference('sysparm_policy_sys_id', sysId);
	dlg.setPreference('sysparm_ok_function', 'Apply');
    dlg.setPreference('sysparm_parent_form', this);
    dlg.render();
}
