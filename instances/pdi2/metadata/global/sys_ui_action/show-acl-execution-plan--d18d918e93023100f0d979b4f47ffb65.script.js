function showAclExecutionPlan(){
	var originalAclName = gel('sys_original.sys_security_acl.name').value;
	var originalOperationID = gel('sys_display.original.sys_security_acl.operation').value;
	var originalResourceID = gel('sys_display.original.sys_security_acl.type').value;
	var originalIsDenyAcl = gel('sys_original.sys_security_acl.decision_type').value  == 'deny';
	var sysId = g_form.getUniqueValue();

	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	//Height is a dummy parameter. The window is automatically sized for its height
	var gDialog = new dialogClass("acl_execution_plan", false, 450, 300);
	gDialog.setPreference('sysparm_identifier', originalAclName);
	gDialog.setPreference('sysparm_operationID', originalOperationID);
	gDialog.setPreference('sysparm_resourceID', originalResourceID);
	gDialog.setPreference('sysparm_isDenyAcl', originalIsDenyAcl);
	gDialog.setPreference('sysparm_sysID', sysId);
	gDialog.setPreference('sysparm_change_type', 'display');
	gDialog.setTitle(new GwtMessage().getMessage("Security Rules for ") + "\"" + originalAclName + "\"");
	gDialog.render();
	
	sendSecurityEvent();
}

function sendSecurityEvent() {
	var ga = new GlideAjax('SecurityEventSender');
	ga.addParam('sysparm_eventName', 'acl.show.execution.plan');
	ga.addParam('sysparm_parm1', '');
	ga.addParam('sysparm_parm2', '');
	ga.getXML();
}
