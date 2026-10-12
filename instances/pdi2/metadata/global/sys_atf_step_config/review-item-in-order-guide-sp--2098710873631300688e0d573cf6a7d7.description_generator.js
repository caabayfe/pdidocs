function generateDescription() {
    var description = "Open '";
	var itemName = step.inputs.catalog_item.getDisplayValue();
	description += itemName;
	description += "' catalog item & " + (step.inputs.included ? 'include' : 'exclude') + ' this item.';
	return description;
}
 generateDescription();
