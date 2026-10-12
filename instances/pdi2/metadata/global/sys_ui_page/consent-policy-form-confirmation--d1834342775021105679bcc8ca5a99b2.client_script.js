function ok() {
    var checkbox = document.getElementById("agree_checkbox");
    if (!checkbox.checked) {
        return;
    }
	var functionName = '${JS:sysparm_ok_function}';
	if(functionName == 'Apply') {
		var sysId = '${JS:sysparm_policy_sys_id}';
		applyConfirmed(sysId);
	} else {
		resetConfirmed();
	}
	destroyDialog();
	return true;
}

function cancel() {
    destroyDialog();
    return false;
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
function resetConfirmed() {
    var ga = new GlideAjax('global.ResetDefaultConsentPolicyOnCountries');
    ga.addParam('sysparm_name', "reset");
    ga.getXML(updateRecords);
}

function applyConfirmed(sysId) {
    var ga = new GlideAjax('global.ApplyConsentPolicyOnCountries');
    ga.addParam('sysparm_name', "apply");
	ga.addParam('sysparm_policy_sys_id', sysId);
    ga.getXML(updateRecords);
}

function updateRecords(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
	var u_g_form = new GlideForm('',true,true,true,true);
	if (answer && answer !== '')
		u_g_form.addInfoMessage(new GwtMessage().getMessage('Action completed successfully.'));
	else
		u_g_form.addErrorMessage(new GwtMessage().getMessage('Action failed.'));
}
