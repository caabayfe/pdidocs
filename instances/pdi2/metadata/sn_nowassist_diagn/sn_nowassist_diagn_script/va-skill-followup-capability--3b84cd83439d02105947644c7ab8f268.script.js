diagnose(); 

function diagnose() {
	var messages = NowAssistDiagnosticUtil.validateCapabilitySettings("VA Skill Followup", "NowAssist VA");
	messages = messages.concat(NowAssistDiagnosticUtil.testRequestExecution({
			"prompt": "can you give me a summary",
			"update_history": "false"
		}, 
		"15fc377c4328311006650464dbb8f2d7",
		"VA Skill Followup")
	);
	return messages;
}
