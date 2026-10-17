function addSubstateEntriesInChoiceTable() {
	var choiceData = [{
		dependent_value: 6,
		element: 'substatus',
		hint: '',
		inactive: false,
		label: 'Pending donation',
		language: 'en',
		name: 'alm_asset',
		sequence: 5,
		value: 'pending_donation',
	}, {
		dependent_value: 9,
		element: 'substatus',
		hint: '',
		inactive: false,
		label: 'Pending donation',
		language: 'en',
		name: 'alm_asset',
		sequence: 5,
		value: 'pending_donation',
	}];
	choiceData.forEach(function(choiceRecordData) {
		var choiceGr = new GlideRecord('sys_choice');
		choiceGr.addQuery('name', choiceRecordData.name);
		choiceGr.addQuery('element', choiceRecordData.element);
		choiceGr.addQuery('value', choiceRecordData.value);
		choiceGr.addQuery('dependent_value', choiceRecordData.dependent_value);
		choiceGr.query();
		if (!choiceGr.hasNext()) {
			choiceGr.initialize();
			Object.keys(choiceRecordData).forEach(function(columnName) {
				choiceGr.setValue(columnName, choiceRecordData[columnName]);
			});
			choiceGr.insert();
		}
	});
}

addSubstateEntriesInChoiceTable();
