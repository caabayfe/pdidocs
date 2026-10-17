
(function(context, pageParams, blockcontext){
	// return some_output
	var skillName = blockcontext.turnOffModalMessage;
    var turnOffModalMessage = sn_i18n.Message.getMessage("sn_nowassist_admin","Deactivate {skillName}? This will deactivate the skill for your users.", {skillName: skillName});
    var translatedText = "<p style='margin:0px;font-size:16px;'>" + turnOffModalMessage + "</p>";
	return {
		deactivateMessage: translatedText
	};
})(context, pageParams, blockcontext);
