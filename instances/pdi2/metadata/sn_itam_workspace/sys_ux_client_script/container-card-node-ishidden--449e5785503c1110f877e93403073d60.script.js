/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(api.state.assetEventDataComplete != null) {
    return false;
  }
  return true;
}
