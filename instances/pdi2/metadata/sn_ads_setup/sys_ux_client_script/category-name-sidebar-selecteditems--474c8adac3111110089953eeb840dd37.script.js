/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {

  if(api.context.props.taskId) 
    return [[]];
  
  let isNewCategory = api.context.props.categoryId === '-1' ? true : false;
  if(isNewCategory) {
    return [["-1"]];
  }

  const category = api.state.categoryInput;
  if(category) {
    return [[category.sys_id]];
  }

	return [[]];
}
