if (current.applies_to == 'item' && !current.catalog_item.nil())
	current.short_description = current.catalog_item.name + " UI policy";
else if (current.applied_to == 'set' && !current.variable_set.name.nil())
	current.short_description = current.variable_set.name + " UI policy";
