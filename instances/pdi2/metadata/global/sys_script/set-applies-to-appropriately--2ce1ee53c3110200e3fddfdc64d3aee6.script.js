function onDisplay(current, g_scratchpad) {
	if (current.catalog_item.hasValue())
		current.applies_to = "item";
	else if (current.variable_set.hasValue())
		current.applies_to = "set";
}
