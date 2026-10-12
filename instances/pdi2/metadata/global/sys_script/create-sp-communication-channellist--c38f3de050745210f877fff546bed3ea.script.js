(function executeRule(current, previous /*null when async*/) {
	var channels = gs.getProperty('glide.sp.portal.channels');
	var tableName = 'sp_portal';
	var elementName = 'communication_channels';
	var channelsList = [];
	var channelsObj;
	var channelListLabels = [];
    try {
        if (!gs.nil(channels)) {
            channelsObj = JSON.parse(channels);
            channelListLabels = Object.keys(channelsObj);
            channelsList = processChannelList(channelsObj, channelListLabels, tableName, elementName);
            deleteInvalidChoices(channelsList, tableName, elementName);
            updateRecordsWithValidChoices(channelsList, tableName, elementName);
        }
    } catch (error) {
		var errorMessage = gs.getMessage("Failed to parse {0} JSON property: {1}", ["glide.sp.portal.channels", error.message]);
		gs.error(errorMessage);
        return;
    }



})(current, previous);

function processChannelList(channelsObj, channelListLabels, tableName, elementName) {
    var channelsList = [];
    var userLanguage = gs.getSession().getLanguage() || 'en';

    for (var i = 0; i < channelListLabels.length; i++) {
        var label = channelListLabels[i];
        var value = channelsObj[label];
        channelsList.push(value);
    }

    var existingChoices = new GlideRecord('sys_choice');
    existingChoices.addQuery('name', tableName);
    existingChoices.addQuery('element', elementName);
    existingChoices.addQuery('language', userLanguage);
    existingChoices.addQuery('value', 'IN', channelsList.join(','));
    existingChoices.query();

    var existingValues = [];
    while (existingChoices.next()) {
        existingValues.push(existingChoices.value.toString().trim());
    }

    // Iterate through the channels and add new choices if they don't exist
    for (var j = 0; j < channelsList.length; j++) {
        var value = channelsList[j];
        if (!existingValues.includes(value)) {
            var newChoice = new GlideRecord('sys_choice');
            newChoice.initialize();
            newChoice.name = tableName;
            newChoice.element = elementName;
            newChoice.value = value;
            newChoice.label = gs.getMessage(channelListLabels[j]);
            newChoice.language = userLanguage;
            newChoice.insert();
        }
    }

    return channelsList;
}

function deleteInvalidChoices(channelsList, tableName, elementName) {
	var choiceGrDelete = new GlideRecord('sys_choice');
	choiceGrDelete.addQuery('name', tableName);
	choiceGrDelete.addQuery('element', elementName);
	choiceGrDelete.query();

	while (choiceGrDelete.next()) {
		var existingChoiceValue = choiceGrDelete.value.toString().trim();

		// If the existing choice in sys_choice is not in the system property, delete it
		if (!channelsList.includes(existingChoiceValue)) {
			choiceGrDelete.deleteRecord();
		}
	}
}

function updateRecordsWithValidChoices(channelsList, tableName, elementName) {
	var recordGr = new GlideRecord(tableName);
	recordGr.query();
	while (recordGr.next()) {
		var selectedValues = recordGr[elementName].toString().split(',').map(function(value) {
			return value.trim();
		});

		var cleanedValues = selectedValues.filter(function(value) {
			return channelsList.includes(value);
		});

		if (cleanedValues.length !== selectedValues.length) {
			recordGr[elementName] = cleanedValues.join(',');
			recordGr.update();
		}
	}
}
