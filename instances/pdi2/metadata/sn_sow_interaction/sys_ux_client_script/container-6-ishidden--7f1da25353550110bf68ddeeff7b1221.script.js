/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(api.state.interactionsList.length === 0 || !api.data.look_up_records.results)
    return true;
  else 
    return (api.data.look_up_records.results && api.data.look_up_records.results.length === 0);
}
