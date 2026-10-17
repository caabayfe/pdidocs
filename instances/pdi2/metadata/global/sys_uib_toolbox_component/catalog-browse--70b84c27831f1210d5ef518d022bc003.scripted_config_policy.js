function componentPolicy({
    api,
    trigger,
    properties
}) {
	if(properties.selectionType == 'catalog')
		api.updateValue("selectCategories", "");
	else if(properties.selectionType == 'category')
		api.updateValue("selectCatalogs", "");
	api.updateVisibility("selectCatalogs", properties.selectionType == 'catalog');
	api.updateVisibility("selectCategories", properties.selectionType == 'category');
}
