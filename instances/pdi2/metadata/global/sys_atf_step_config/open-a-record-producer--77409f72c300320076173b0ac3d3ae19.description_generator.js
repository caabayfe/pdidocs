function generateDescription(step) {
    // the global variable 'step' represents the current glide record
    var producerItemName = step.inputs.catalog_item.getDisplayValue();
    var description = gs.getMessage("Open '{0}' Record Producer", producerItemName);
	return description;
}
 generateDescription(step);
