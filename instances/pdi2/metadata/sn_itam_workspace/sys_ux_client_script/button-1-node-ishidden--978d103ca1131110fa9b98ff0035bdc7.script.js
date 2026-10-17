/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  var canCreate = api.data.table_access_transform_1.output.canCreate;
  return !canCreate;
}
