function generateDescription(step) {
    // the global variable 'step' represents the current glide record
	var tokens = [];
    var description = "Search for '{0}'";
	tokens.push(step.inputs.search_term + '');
	if (!gs.nil(step.inputs.catalog)) {
		description += " in '{1}'";
		var catalogName = new sn_sc.Catalog(step.inputs.catalog + '').getTitle();
		tokens.push(catalogName);
	}
	if (!gs.nil(step.inputs.category)) {
		if (step.inputs.catalog)
			description += " and '{" + tokens.length + "}' category";
		else
			description += " in '{"+ tokens.length +"}' category";
		var categoryName = new sn_sc.CatCategory(step.inputs.category + '').getTitle();
		tokens.push(categoryName);
	}
	if (step.inputs.assert_item) {
		if (step.inputs.assert_type == 'assert_item_present')
			description += " and confirm that the search returns '{" + tokens.length + "}' item";
		else
			description += " and confirm that the search doesnot return '{" + tokens.length + "}' item";
		var catItemName = new sn_sc.CatItem(step.inputs.assert_item + '').getItemSummary().name;
		tokens.push(catItemName);
	}
	description = gs.getMessage(description, tokens);
	// your code here
	return description;
}
 generateDescription(step);
