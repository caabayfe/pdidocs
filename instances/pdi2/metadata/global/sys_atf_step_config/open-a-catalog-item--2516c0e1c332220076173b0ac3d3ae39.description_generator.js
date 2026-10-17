function generateDescription(step) {
    // the global variable 'step' represents the current glide record
	var catItemName = step.inputs.catalog_item.getDisplayValue();
    var description = gs.getMessage("Open '{0}' catalog item", catItemName);
	return description;
}
 generateDescription(step);
