/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
   if(api.state.secondaryValues && api.state.secondaryValues != '') {
    return false;
  }
  else {
    return true;
  }  
}
