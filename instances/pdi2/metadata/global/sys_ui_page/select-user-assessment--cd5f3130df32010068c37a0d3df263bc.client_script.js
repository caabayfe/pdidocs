function impOk() {
	var is_ok = false;
	var sys_user = gel(gel('assessor_query').value);
	var display = gel('sys_display.' + gel('assessor_query').value);
	if (sys_user.value != '')
		is_ok = true;
	
	var asr_recent = getSelectValues(gel('asr_recent'));// This function returns a string
	if (asr_recent)
		is_ok = true;
	
	if (!is_ok) {
		alert('Please select a user to assess this record');
		return false;
	}
	
	var form = document.forms['form.' + '${sys_id}'];
	addInput(form, "HIDDEN", "sys_user", sys_user.value);
	addInput(form, "HIDDEN", "user_name", display.value);
	addInput(form, "HIDDEN", "selected_values", asr_recent);
	gel('poll_img').style.display = 'block';
}


function getSelectValues(select) {
	var result = [];
	var options = select && select.options;
	var opt;

	for (var i = 0; i < options.length; i++) {
		opt = options[i];
		if (opt.selected)
			result.push(opt.value);
	}
	return result.join();
}

function clearSelect() {
	var sel = gel('asr_recent');
	for (var i =0; i<sel.options.length; i++)
		sel.options[i].selected = false;
}

function clearRef() {
	var sys_user = gel(gel('assessor_query').value);
	sys_user.value = "";
	var display = gel('sys_display.' + gel('assessor_query').value);
	display.value = "";
	setLightWeightLink('sys_user');
}
