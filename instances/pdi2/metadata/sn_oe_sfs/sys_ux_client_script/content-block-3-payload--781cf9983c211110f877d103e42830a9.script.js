/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.aceContentBlocks[2].children[0].type.route == "accordion")
	  return api.state.aceContentBlocks[2].children[0];
  return api.state.aceContentBlocks[2].children[1];
}
