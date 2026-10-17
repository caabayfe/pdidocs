(function() {
	// From paris the substate choice list will also contain Pending disposal when state is Retired
	var sysChoiceGr = new GlideRecord('sys_choice');
	sysChoiceGr.addQuery('name', 'alm_asset');
	sysChoiceGr.addQuery('element', 'substatus');
	sysChoiceGr.addQuery('value', 'pending_disposal');
	sysChoiceGr.addQuery('dependent_value', 7);
	sysChoiceGr.query();
	if (!sysChoiceGr.next()) {
		sysChoiceGr.initialize();
		sysChoiceGr.setValue('name', 'alm_asset');
		sysChoiceGr.setValue('element', 'substatus');
		sysChoiceGr.setValue('sequence', 5);
		sysChoiceGr.setValue('label', 'Pending disposal');
		sysChoiceGr.setValue('value', 'pending_disposal');
		sysChoiceGr.setValue('dependent_value', 7);
		if (sysChoiceGr.insert()) {
			gs.log('Fix Script: Show Pending disposal in substate choice list when Retired state is selected on Asset');
		} else { gs.log('Fix Script: Asset: Update substate choice list - Failed'); }
	}
}());
