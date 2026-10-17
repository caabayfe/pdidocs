function onLoad() {
	var step_type = getParmVal('sysparm_step_type');
	if (step_type) {
		g_form.setReadOnly('connection_type',true);
		if (step_type == 'jdbc') {
			g_form.setValue('connection_type','jdbc_retry_conditions');
		} else if (step_type == 'soap' || step_type == 'rest') {
			g_form.setValue('connection_type','http_retry_conditions');   
		} else if (step_type == 'sftp') {
			g_form.setValue('connection_type','basic_retry_conditions'); 
		}
	}
}

function getParmVal(name){
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(top.location);
	if (results == null) {
		return "";
	} else {
		return unescape(results[1]);
	}
}
