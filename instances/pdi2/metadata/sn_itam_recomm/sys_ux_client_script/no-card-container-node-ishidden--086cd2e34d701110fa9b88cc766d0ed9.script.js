/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(api.state.importantActions.length > 0 || !api.state.importantActionsLoaded) {
    return true;
  }
  return false;
}
