fixCascadeRuleForUniversalRequest();

function fixCascadeRuleForUniversalRequest() {
	if (pm.isZboot())
		return;

	var dictionaryGr = new GlideRecord('sys_dictionary');
	dictionaryGr.addQuery('name', 'task');
	dictionaryGr.addQuery('element', 'universal_request');
	dictionaryGr.query();
	if (dictionaryGr.next() && dictionaryGr.getValue('reference_cascade_rule') != 'none') {
		dictionaryGr.setValue('reference_cascade_rule', 'none');
		dictionaryGr.update();
	}
}
