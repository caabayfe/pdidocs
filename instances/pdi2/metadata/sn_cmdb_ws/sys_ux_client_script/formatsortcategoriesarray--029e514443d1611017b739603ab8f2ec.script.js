function script({ api, event }) {
	//FormatSortCategoriesArray script in Filter and Sort controller; binds the categories as radio button array, fired on macroponent changed event
	const { sortCategoriesArray } = api.context.props
	if (!Array.isArray(sortCategoriesArray) || sortCategoriesArray.length === 0)
		return;

	const optionsObj = sortCategoriesArray.map((sortCategory) => {
		return {
			"id": sortCategory["id"],
			"label": sortCategory["label"]
		}
	});

	api.setState("radioButtonJson", optionsObj);
	api.setState("sortCategory", sortCategoriesArray[0]["id"]);
	api.setState("sortDirection", "asc");
	api.setState("searchTerm", "");
	api.setState("showFilter", false);
}
