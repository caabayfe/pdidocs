function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == 'true') {
		MIDDeploymentRequest_MIDServerNameAutoGeneration.parentNode.style.display = "block";
		_show('mid_server_name_prefix', true);
		MIDDeploymentRequest_MIDQuantity.parentNode.style.display = "block";
		_show('mid_quantity', true);		
		MIDDeploymentRequest_MIDServerNames.parentNode.style.display = "none";
		_hide('mid_server_names');
	} else {
		MIDDeploymentRequest_MIDServerNameAutoGeneration.parentNode.style.display = "none";
		_hide('mid_server_name_prefix');
		MIDDeploymentRequest_MIDQuantity.parentNode.style.display = "none";
		_hide('mid_quantity');
		MIDDeploymentRequest_MIDServerNames.parentNode.style.display = "block";
		_show('mid_server_names', true);
	}
}

function _hide(fieldname) {
    g_form.setMandatory(fieldname, false);
    g_form.setDisplay(fieldname, false);
}

function _show(fieldname, isRequired) {
    if (isRequired)
        g_form.setMandatory(fieldname, true);
    g_form.setDisplay(fieldname, true);
}
