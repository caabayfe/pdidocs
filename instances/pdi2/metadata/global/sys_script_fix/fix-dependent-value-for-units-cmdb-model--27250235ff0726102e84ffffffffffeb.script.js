
// --- Update sys_dictionary for cmdb_model dependent fields ---
var elementsToUpdate = ['dimensions_unit', 'volume_unit', 'weight_unit'];

elementsToUpdate.forEach(function(elementName) {
	var dictGR = new GlideRecord('sys_dictionary');
	dictGR.addQuery('name', 'cmdb_model');
	dictGR.addQuery('element', elementName);
	dictGR.query();
	if (dictGR.next()) {
		dictGR.setValue('use_dependent_field', true);
		dictGR.setValue('dependent_on_field', 'unit_of_measure_system');
		dictGR.setValue('dependent', 'unit_of_measure_system');
		var dictSysId = dictGR.update();
		if (dictSysId) {
			gs.info('[SUCCESS] sys_dictionary updated for element: ' + elementName);
		} else {
			gs.warn('[FAILURE] Failed to update sys_dictionary for element: ' + elementName);
		}
	} else {
		gs.warn('[NOT FOUND] sys_dictionary entry not found for element: ' + elementName);
	}
});

// --- Reusable function to update sys_choice dependent values with validation ---
function updateDependentValues(elementName, valueMap) {
	for (var val in valueMap) {
		var choiceGR = new GlideRecord('sys_choice');
		choiceGR.addQuery('name', 'cmdb_model');
		choiceGR.addQuery('element', elementName);
		choiceGR.addQuery('language', 'en');
		choiceGR.addQuery('value', val);
		choiceGR.query();
		if (choiceGR.next()) {
			choiceGR.setValue('dependent_value', valueMap[val]);
			var choiceSysId = choiceGR.update();
			if (choiceSysId) {
				gs.info('[SUCCESS] sys_choice updated: element = ' + elementName + ', value=' + val + ', dependent_value=' + valueMap[val]);
			} else {
				gs.warn('[FAILURE] Failed to update sys_choice: element=' + elementName + ', value=' + val);
			}
		} else {
			gs.warn('[NOT FOUND] sys_choice not found: element=' + elementName + ', value=' + val);
		}
	}
}

// --- Define value maps for each element ---
var dimensionsMap = {
	cm: 'metric',
	km: 'metric',
	m: 'metric',
	ft: 'us imperial',
	'in': 'us imperial', // eslint-disable-line quote-props
	mi: 'us imperial',
};

var volumeMap = {
	cc: 'metric',
	fl: 'metric',
	ltr: 'metric',
	gal: 'us imperial',
	oz: 'us imperial',
};

var weightMap = {
	g: 'metric',
	kg: 'metric',
	lb: 'us imperial',
	oz: 'us imperial',
};

// --- Apply updates using reusable function ---
updateDependentValues('dimensions_unit', dimensionsMap);
updateDependentValues('volume_unit', volumeMap);
updateDependentValues('weight_unit', weightMap);
