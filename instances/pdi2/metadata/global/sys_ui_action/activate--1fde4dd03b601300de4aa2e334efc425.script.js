activateRule();
function activateRule(){
	current.active = true;
	current.update();
	
	var redirectUrl = "sys_rate_limit_rules_list.do";
	var currentFilter = RP.getParameterValue('sysparm_query');
	if(currentFilter)
		redirectUrl = redirectUrl + "?sysparm_query=" + currentFilter;
	
	action.setRedirectURL(redirectUrl);
}
