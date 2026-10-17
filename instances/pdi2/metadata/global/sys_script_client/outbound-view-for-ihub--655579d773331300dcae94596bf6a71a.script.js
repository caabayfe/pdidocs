function onLoad() {
	g_form.setReadOnly('type',true);
	var view = getView();
	var ref = getParmVal('sysparm_reference');
	if(ref == 'sys_soap_security_policy' || view == 'outbound' ) {
		g_form.setValue('type','outbound') ;
		
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
