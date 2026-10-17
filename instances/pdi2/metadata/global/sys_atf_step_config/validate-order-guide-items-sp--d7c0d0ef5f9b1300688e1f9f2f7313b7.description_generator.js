function generateDescription() {
    var description = "Validate that following items are included in the Order Guide: ";

	if (step.inputs.catalog_items.hasMapping())
		return description += step.inputs.catalog_items.getDisplayValue();

	var gr = new GlideRecord('sc_cat_item');
	gr.addQuery('sys_id', 'IN', step.inputs.catalog_items + '');
	gr.query();
	while (gr.next())
		description += gr.name + ', ';
	return description.slice(0, -2);
}
 generateDescription();
