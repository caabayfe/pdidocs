var gotoUrl = null;

function browserAwareRedirecr() {   
    var objSysId = g_form.getUniqueValue();
	if (navigator.appName == 'Microsoft Internet Explorer') {
		var ie7_8 =  (navigator.appVersion.indexOf('MSIE 7.0') > -1) ||  (navigator.appVersion.indexOf('MSIE 8.0') > -1);
		gotoUrl = "knowledge_home_launcher.do";
	} else {
		gotoUrl = "knowledge_home_launcher.do?browse_type=categories&sysparm_kb="+objSysId;
	}
	window.location.href = gotoUrl;
}
