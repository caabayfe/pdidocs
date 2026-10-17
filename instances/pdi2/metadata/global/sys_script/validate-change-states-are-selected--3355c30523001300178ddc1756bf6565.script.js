(function executeRule(current, previous /*null when async*/) {
	var triggerValue = gs.getProperty('com.snc.change_request.auto.discovery', 'off');
	var manualProperty = current.getValue('name') === 'com.snc.change_request.disco.manual.state';
	var autoProperty = current.getValue('name') === 'com.snc.change_request.disco.auto.state';

	//do not check state values if the trigger discovery is off
	if (triggerValue === 'off')
		return;

	//Check states for manual / Both and not when current is auto
	if (triggerValue === 'manual' && autoProperty)
		return;

	//Check states for automatic / Both and not when current is manual
	if (triggerValue === 'automatic' && manualProperty)
		return;

	if (!current.getValue('value')) {
		if (manualProperty)
			gs.addErrorMessage(gs.getMessage('Change Request states need to be defined to manually trigger Discovery'));

		if (autoProperty)
			gs.addErrorMessage(gs.getMessage('Change Request states need to be defined to automatically trigger Discovery'));

		current.setAbortAction(true);
	}

	var choiceList = new GlideChoiceList().getChoiceList('change_request', 'state');
	var proposedValuesArray = current.getValue('value').split(',');

	for (var i = 0; i < proposedValuesArray.length; i++) {
		var choiceFound = false;
		var proposedValue = proposedValuesArray[i].trim();
		for (var j = 0; j < choiceList.getSize(); j++) {
			var choice = choiceList.getChoice(j);
			if ((proposedValue === (choice.getValue()+'')) || (proposedValue === (choice.getLabel()+'')))
				choiceFound = true;
		}
		if (!choiceFound) {
			gs.addErrorMessage(gs.getMessage('{0} is not a valid state value to be used for triggering Discovery', [proposedValue]));
			current.setAbortAction(true);
		}
	}
})(current, previous);
