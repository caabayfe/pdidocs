var modelCatDictionary = new GlideRecord('sys_dictionary');
modelCatDictionary.addQuery('name', 'cmdb_model_category');
modelCatDictionary.addQuery('internal_type', 'collection');
modelCatDictionary.addQuery('audit', false);
modelCatDictionary.query();
if (modelCatDictionary.next()) {
	modelCatDictionary.setValue('audit', true);
	modelCatDictionary.update();
	var columnsDict = new GlideRecord('sys_dictionary');
	columnsDict.addQuery('name', 'cmdb_model_category');
	columnsDict.addQuery('element', 'IN', 'picture,allow_pre_allocation,allow_in_bundle,allow_as_master,bundle');
	columnsDict.query();
	while (columnsDict.next()) {
		var oldValue = columnsDict.getValue('attributes');
		if (gs.nil(oldValue)) {
			oldValue = '';
		} else {
			oldValue += ',';
		}
		var newValue = oldValue + 'no_audit=true';
		columnsDict.setValue('attributes', newValue);
		columnsDict.update();
	}
}
