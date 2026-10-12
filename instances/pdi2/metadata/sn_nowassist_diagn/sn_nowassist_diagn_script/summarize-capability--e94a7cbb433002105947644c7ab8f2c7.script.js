diagnose();

function diagnose() {
	var messages = NowAssistDiagnosticUtil.validateCapabilitySettings("Summarize", "Gen AI Controller");

	messages = messages.concat(NowAssistDiagnosticUtil.testRequestExecution({
			"textToSummarize": "Please summarize my text. This is placeholder text meant only for summarization by the reader into smaller and more condensed text." 
		}, 
		"02def939533121106b38ddeeff7b1237",
		"Summarize")
	);

	return messages;
}
