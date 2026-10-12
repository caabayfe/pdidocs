/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.categoryId === "-1") {
    return null;
  }
  
  if(!api.data.get_all_categories.results) {
    return;
  }

  let categories = api.data.get_all_categories.results;
  categories.sort((cat1, cat2) => cat1.order.value - cat2.order.value);
  categories = categories.map(category => {
    if(!category) return;
    return {
      id: category._row_data.uniqueValue,
      label: category.name.displayValue
    };
  });
  
	if(categories.length > 0 && categories[categories.length-1].id !== api.context.props.categoryId) {
    return helpers.translateSync('Next category');
  }
  return null;
}
