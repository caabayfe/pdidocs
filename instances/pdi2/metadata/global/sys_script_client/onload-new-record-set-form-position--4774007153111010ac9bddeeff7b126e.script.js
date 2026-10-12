function getParameterByName(name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function onLoad() {
	var target = getParameterByName('sysparm_target');
	var sysId = getParameterByName('sys_id');
	if (target == 'sys_ux_form_action.declarative_action' && sysId == '-1') {
		g_form.setValue('model','360935e9534723003eddddeeff7b127d');
		g_form.setValue('form_position', 'action_bar');
		g_form.setValue('declarative_action_type', 'uxf_client_action');
	}
	
	if (g_form.getValue('form_position') == 'action_bar' && g_form.getValue('model') == '360935e9534723003eddddeeff7b127d') {
		g_form.removeOption('declarative_action_type', 'action_component');
		g_form.removeOption('declarative_action_type', 'dispatch_action');
	}	
}
