/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(api.context.props.categoryId === '-1') {
    return 'New Category';
  }

  if(api.data.get_setup_category_rest.output) {
    return api.data.get_setup_category_rest.output.result.name;
  }
  
  return '';
}
