function onBefore(current, previous) {
	if (current.applies_to == "item")
		current.variable_set = "";
	else if (current.applies_to == "set")
		current.catalog_item = "";
}
