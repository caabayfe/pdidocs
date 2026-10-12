function renameProductTypeLabel() {
	var newlabel = gs.getMessage('Allow as main');
	var newPluralLabel = gs.getMessage('Allow as mains');
	var newHint = gs.getMessage('When true, assets of this category can be'
		+ ' the main components of a bundle, with other components attaching to them');

	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'cmdb_model_category');
	grUpdate.addQuery('element', 'allow_as_master');
	grUpdate.addQuery('label', '!=', newlabel);
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newPluralLabel);
		grUpdate.setValue('hint', newHint);
		grUpdate.update();
	}

	// update dictionary entry for product_type field
	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'cmdb_model_category');
	dictGr.addQuery('element', 'allow_as_master');
	dictGr.addQuery('column_label', '!=', newlabel);
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.update();
	}
}

renameProductTypeLabel();
