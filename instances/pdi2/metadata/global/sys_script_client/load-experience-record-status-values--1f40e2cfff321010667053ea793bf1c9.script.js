function onLoad() {
	function onError(){
		g_form.addErrorMessage('Unable to load experience status choices.');
	}
	if (!g_scratchpad) 
		onError();

	var choiceList = g_scratchpad.statusChoices;

	if(!choiceList || !choiceList.size())
		onError();

	var statusField = 'experience_status_record_value';
	var statusValue = g_form.getValue(statusField);
	var setValue, choiceValue;

	g_form.clearOptions(statusField);

	choiceList.forEach(function(choice){
		g_form.addOption(statusField, choice.value, choice.label);
		if (statusValue === choice.value)
			setValue = choice.value;
	});

	if (setValue)
		g_form.setValue(statusField, setValue);
}
