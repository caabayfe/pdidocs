function onLoad() {
   //Type appropriate comment here, and begin script below
	var ga = new GlideAjax("ProblemUtilsClientSNC");
	ga.addParam('sysparm_name', 'isDisplayReassessInfoForClosedPrb');
	ga.addParam('sysparm_ptaskSysId', g_form.getUniqueValue());
	ga.getXMLAnswer(processMessage);
	
	function processMessage(answer) {
		if (answer === 'true')
			g_form.addInfoMessage(getMessage("This Problem Task cannot be re-assessed because the related Problem is Closed."));
	}
}
