(function executeStep(inputs, outputs, stepResult) {
	var MESSAGE_KEY_FAIL_EMPTY_SEARCH_TERM = "FAILURE: Search term is empty";

	if (gs.nil(inputs.search_term)) {
		stepResult.setOutputMessage(gs.getMessage(MESSAGE_KEY_FAIL_EMPTY_SEARCH_TERM));
		stepResult.setFailed();
		return;
	}
	var searchTerm = "" + inputs.search_term;
	var catalogId = gs.nil(inputs.catalog) ? "" : "" + inputs.catalog;
	var categoryId = gs.nil(inputs.category) ? "" : "" + inputs.category;
	var assertType = gs.nil(inputs.assert_type) ? "assert_item_present" : inputs.assert_type;
	var catItemName = new sn_sc.CatItem(inputs.assert_item + '').getItemSummary().name;
	var foundItem = false;
	var searchInPortal = inputs.search_in_portal;

	var gr = new sn_sc.CatalogSearch().search(catalogId, categoryId, searchTerm, false, true, searchInPortal);
	gr.query();
	while (gr.next()) {
		var item = new sn_sc.CatItem(gr.getUniqueValue() + "");
		if (item.canView()) {
			if (gr.getUniqueValue() == inputs.assert_item) {
				foundItem = true;
				outputs.catalog_item_id = gr.getUniqueValue();
				break;
			}
		}
	}
	if (assertType == 'assert_item_present') {
		if (foundItem) {
			stepResult.setOutputMessage(gs.getMessage("SUCCESS: Found item '{0}'", catItemName));
			stepResult.setSuccess();
		} else {
			stepResult.setOutputMessage(gs.getMessage("FAILURE: Search did not return '{0}'", catItemName));
			stepResult.setFailed();
		}
	}
	else {
		if (!foundItem) {
			stepResult.setOutputMessage(gs.getMessage("SUCCESS: Search did not return '{0}'", catItemName));
			stepResult.setSuccess();
		} else {
			stepResult.setOutputMessage(gs.getMessage("FAILURE: Found item '{0}'", catItemName));
			stepResult.setFailed();
		}
	}
}(inputs, outputs, stepResult));
