var preserveReasonSelect = document.getElementById('preserveReasonSelectElement');
var o = GlideDialogWindow.prototype.get('clone_large_preserver_warning_popup');
var options = o.getPreference('options');
var sysId = o.getPreference('sys_id');
document.getElementById('largeTablesInPreserverWarning').innerHTML = options.warningMessage;
var tarea = document.createElement('textarea');
tarea.setAttribute('id','preserveReason');
tarea.setAttribute('placeholder','Specifying reason is mandatory.');
tarea.style.cssText = 'width:350px;height:100px;display:none';
var oDiv = document.getElementById('optionsDiv');
oDiv.appendChild(tarea);

var preserveReasonTextArea = document.getElementById('preserveReason');

for (var key=0;key<options.reasonsForLargePreserver.length;key++) {
	var option = document.createElement("option");
	option.setAttribute("value", options.reasonsForLargePreserver[key]);
	option.text = options.reasonsForLargePreserver[key];
	preserveReasonSelect.appendChild(option);
}

preserveReasonTextArea.addEventListener("change",function onChangeReason(){
	if(this.value == '')
		document.getElementById('ok_button').disabled = true;
	else 
		document.getElementById('ok_button').disabled = false;
});

preserveReasonSelect.addEventListener("change",function onChangeReasonSelect(){
	if(this.options[this.selectedIndex].value == "Others") {
		document.getElementById('ok_button').disabled = true;
		tarea.style.display = "block";
	} else {
		document.getElementById('ok_button').disabled = false;
		tarea.style.display = "none";
	}
});

function onOk() {
	GlideDialogWindow.get().destroy();
	var ga = new GlideAjax("InstanceCloneManagerAjax");
	ga.addParam("sysparm_name", "logLargePreserverReason");
	ga.addParam("sysparm_sys_id", sysId); 
	ga.addParam("sysparm_table", "clone_instance");
	ga.addParam("sysparm_preserve_reason",preserveReasonSelect.options[preserveReasonSelect.selectedIndex].value);
	ga.addParam("sysparm_preserve_other_reason",tarea.value);
	ga.getXMLWait();
	if(ga.getAnswer()=='false') 
		return false;
	if (!isTargetAuthenticated()) {
		authenticateTarget(_showConfirmationDialog);
		return false;
	}
	_showConfirmationDialog();
}

function onCancel() {
	GlideDialogWindow.get().destroy();
	return false;
}

function _showConfirmationDialog() {
	_dialog = new GlideDialogWindow('clone_confirm');
	if(g_form.getValue('preserve_in_progress_update_sets') != '')
		_startClone();
	else {
		_canSubmit = false;
		_dialog.setTitle('Confirm');
		_dialog.setPreference('onOK', _startClone);
		_dialog.setPreference('onCancel', _cancelClone);
		_dialog.render();
	}
}

function _startClone() {
	_canSubmit = true;
	setSubmit();
	_dialog.destroy();
	
	var action = gel('sysverb_insert');
	// check if insert ui action was hidden, look for insert and stay
	if (!action)
		action = gel('sysverb_update_and_stay');
	gsftSubmit(action);
}

function _cancelClone() {
	_dialog.destroy();
}
