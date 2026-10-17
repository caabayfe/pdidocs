/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(api.state.assetEventDataComplete == null) {
    return false;
  }
  return true;
  /*
	//var obj = JSON.parse(api.state.assetEventDataComplete);
	if(api.context.props.assetId == '-1') {
    console.log("Returning false");
    return false;
  }
  console.log("Returning true");
  return true;
  */
}
