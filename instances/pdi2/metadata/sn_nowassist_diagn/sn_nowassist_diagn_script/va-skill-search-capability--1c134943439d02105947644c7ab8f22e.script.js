diagnose(); 

function diagnose() {
	var messages = NowAssistDiagnosticUtil.validateCapabilitySettings("VA Skill Search", "NowAssist VA");

	messages = messages.concat(NowAssistDiagnosticUtil.testRequestExecution({
			"caller": "NAP:",
			"skill_list": JSON.stringify([
				{
					"title": "Order Laptop",
					"metaData": {
						"name": "Order Laptop",
						"description": "This is a skill that is used to help user order laptops",
						"attributes": [{"name": "laptop make", "description": "the make of the laptop (an be Macbook, Lenovo or Dell))"},
						{"name": "ram size", "description": "the ram capability of the laptop (can be 16gb or 32gb))"},
						{"name": "screen size", "description": "the screen size of the laptop (can be 14 inches or 16 inches)"}
						]
					},
				}
			]),
			"utterance": "I want to order a laptop"
		}, 
		"bb25ad08438cb91006650464dbb8f2aa",
		"VA Skill Search",
		function(capabilityResponse) {
			var llmResponse = JSON.parse(capabilityResponse.response);
			if (typeof llmResponse.skills != "object") {
				return [new DiagnosticMessage("Unexpected response from llm: " + JSON.stringify(capabilityResponse), "Check the response and logs for details")];
			}
			return [];
		})
	);

	return messages;
}
