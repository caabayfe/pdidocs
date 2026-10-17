/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  
  if (api.data.get_setup_1.output && api.data.get_setup_1.output.result && api.data.get_setup_1.output.result.setup) {
    let categories = api.data.get_setup_1.output.result.setup.steps;
    categories = categories && categories.length > 0 ? categories.map(item => ({"label": item.name, "id": item.sys_id})) : [];
    return categories;
  }
  
  return [];
}
