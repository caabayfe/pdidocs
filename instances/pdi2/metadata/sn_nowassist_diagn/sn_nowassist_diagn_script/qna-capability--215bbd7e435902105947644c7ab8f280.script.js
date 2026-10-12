diagnose(); 

function diagnose() {
	var messages = NowAssistDiagnosticUtil.validateCapabilitySettings("QnA", "NowAssist in AI Search");

	messages = messages.concat(NowAssistDiagnosticUtil.testRequestExecution({
            "query": "What is the warranty period?",
            "top_kbs": JSON.stringify([{
                "text": "Your newly acquired Dell computer comes with a limited factory warranty of 5 years for parts and labor coverage.",
                "source": "kb"
            }])
		},
		"c40246b9533121106b38ddeeff7b1250",
		"QnA")
	); 

	return messages;

}
