$j('title').text("${gs.getMessage('Password Reset - Service Desk')}");
addLoadEvent(onLoadPopulateProcessSelect);
addLoadEvent(onLoadUpdateUserSelectFieldMarker);
addLoadEvent(focusOnCorrectField);
	
function goBack() {
    window.history.back();
}

function enableVerifyButton() {
	clearErrorMessage();
	if(document.getElementById("processSelectId").value == '0')
		document.getElementById("sysverb_pwd_reset").disabled = true;
	else
		document.getElementById("sysverb_pwd_reset").disabled = false;
}

function focusOnCorrectField() {
	var user = gel('sys_display.ref_sys_user');
	if ((user != undefined) && (user.value == "")) {
		user.focus();
		return;
	}
	gel('processSelectId').focus();
}

function onLoadPopulateProcessSelect() {
	var fromSysUserForm = gel('ref_sys_user').value;
	if (fromSysUserForm.length > 0) {
		populateProcessSelect();
	}
}

function clearErrorMessage() {
	clearFieldError('error_msg_id', 'user_id_form_group');
	clearFieldError('error_msg_select', 'process_select_form_group');
}

function populateProcessSelect() {
	clearErrorMessage();
	var user_id = gel('ref_sys_user').value;
	
	var sel = document.getElementById("processSelectId");
	sel.options.length = 1;
	clearSelectProcessField(sel);

	if (user_id != "") {
		
		var ga = new GlideAjax('PwdAjaxVerifyIdentityServiceDesk');
		ga.addParam('sysparm_name', 'getProcessNamesAsync');
		ga.addParam('sysparm_user', user_id);
		ga.getXML(function(response) {
			var processes = response.responseXML.getElementsByTagName("process");
			var numProcesses = processes.length;
			for (var i = 0; i < processes.length; i++) {
				var name = processes[i].getAttribute("name");
				var procSysId = processes[i].getAttribute("procSysId");
				sel[i + 1] = new Option(name, procSysId);
			}
			if (numProcesses == 0) {
				displayFieldError("error_msg_select", getMessage('No service-desk processes found for the user selected.'), "process_select_form_group");
			}
		});
	}
}

var wasSubmitted = false;
function verifyIdentity() {
	if (wasSubmitted)
		return false;
	wasSubmitted = true;
	
	clearErrorMessage();
	var user_id = gel('ref_sys_user').value;
	if ((user_id == undefined) || (user_id == "")) {
		displayFieldError("error_msg_id", getMessage("Invalid user"), "user_id_form_group");
		wasSubmitted = false;
		return false;
	}
	
	var sel = document.getElementById("processSelectId");
	var procSysId = sel.options[sel.selectedIndex].value;
	
	if (sel.selectedIndex == 0) {
		displayFieldError("error_msg_select", getMessage("Invalid selection"), "process_select_form_group");
		wasSubmitted = false;
		return false;
	}
	
	//showPwdLoadingDialog(); //Removing the PopUp as the Call has been made Asynchronous
	var ga = new GlideAjax('PwdAjaxVerifyIdentityServiceDesk');
	ga.addParam('sysparm_name', 'saveAndProceed');
	ga.addParam('sysparm_user_id', user_id);
	ga.addParam('sysparm_procSysId', procSysId);
	
	ga.getXML(function(response) {
		var result = response.responseXML.getElementsByTagName("result");
		var status = result[0].getAttribute("status");
		
		if (!status.match(/success/i)) {
			displayFieldError("error_msg_id", status, "user_id_form_group");
		} else {
			var submitForm = gel('pwd_master_form');
			submitForm.action = '$pwd_verify.do';
			submitForm.submit();
		}
		wasSubmitted = false;
	});
	return false;
}

function clearSelectProcessField(selectElement) {
	updateMandatoryMarker(selectElement, 'process_select_form_group');
	if (gel("select2-chosen-1")) 
		gel("select2-chosen-1").innerHTML = selectElement.options[0].innerHTML;
	enableVerifyButton();
}

function onLoadUpdateUserSelectFieldMarker() {
	if (gel('ref_sys_user')) {
		var userNameField = gel('ref_sys_user');
		updateMandatoryMarker(userNameField,'user_id_form_group');
	}	
}

function isEmailAddress(str) {
	var email_pattern = /^\w+(\.\w+)*@\w+(\.\w+)+$/;
	return str.match(email_pattern);
}

function errorImage() {
	return '<img src="images/outputmsg_error.gifx" alt="Error Message" />';
}

function showPwdLoadingDialog() {
	loadingDialog = new GlideModal("pwd_request_in_progress", true);
    loadingDialog.setTitle(getMessage('Request in progress'));
    loadingDialog.render();
}
