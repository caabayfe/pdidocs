function onLoad() {
	var stdChangeProducerSysId = getParmVal('std_change_producer');
	if (stdChangeProducerSysId) {
		g_form.setValue('variables.std_change_producer', stdChangeProducerSysId);
	}
}


function getParmVal(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results) {
		return unescape(results[1]);
	} else {
		return '';
	}
}
