/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.aceContentBlocks[2].children[0].type.id == "439e03fbeb610110d05213b347522802")
	  return api.state.aceContentBlocks[2].children[0].children;
  return api.state.aceContentBlocks[2].children[1].children;
}
