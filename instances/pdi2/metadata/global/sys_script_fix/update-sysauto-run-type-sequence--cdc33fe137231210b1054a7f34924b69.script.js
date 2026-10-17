updateChoiceSequence();

function updateChoiceSequence() {
	if(pm.isZboot())
		return;
	var choice = new GlideRecord("sys_choice");
	choice.addQuery("name", "sysauto");
	choice.addQuery("element", "run_type");
	choice.query();
	var updatedChoices = [];
	var choiceWasUpdated = false;
	while (choice.next()) {
		var choiceValue = String(choice.value);
		switch (choiceValue) {
			case 'daily':
				choiceWasUpdated = setChoiceSequence(choice, 0);
				break;
			case 'day_and_month_in_year':
				choiceWasUpdated = setChoiceSequence(choice, 1);
				break;
			case 'weekly':
				choiceWasUpdated = setChoiceSequence(choice, 2);
				break;
			case 'monthly':
				choiceWasUpdated = setChoiceSequence(choice, 3);
				break;
			case 'day_week_month_year':
				choiceWasUpdated = setChoiceSequence(choice, 4);
				break;
			case 'periodically':
				choiceWasUpdated = setChoiceSequence(choice, 5);
				break;
			case 'once':
				choiceWasUpdated = setChoiceSequence(choice, 6);
				break;
			case 'on_demand':
				choiceWasUpdated = setChoiceSequence(choice, 7);
				break;
			case 'week_in_month':
				choiceWasUpdated = setChoiceSequence(choice, 8);
				break;
			case 'business_calendar_start':
				choiceWasUpdated = setChoiceSequence(choice, 50);
				break;
			case 'business_calendar_end':
				choiceWasUpdated = setChoiceSequence(choice, 51);
				break;
			default:
				break;
		}
		if(choiceWasUpdated && !updatedChoices.includes(choiceValue)){
			updatedChoices.push(choiceValue);
			choiceWasUpdated=false;
		}
	}
	if (updatedChoices.length > 0)
		gs.info("sequence order changed as part of upgrade for sysauto.run_type choices: " + updatedChoices);
}

function setChoiceSequence(choice, sequenceNumber) {
	if (choice.sequence != sequenceNumber) {
		choice.setValue("sequence", sequenceNumber);
		if(choice.update()) {
			return true;
		} else {
			gs.warn("Failed to update sequence for sysauto.run_type choice: " + choice.value);
			return false;
		}
	} else {
		return false;
	}
}
