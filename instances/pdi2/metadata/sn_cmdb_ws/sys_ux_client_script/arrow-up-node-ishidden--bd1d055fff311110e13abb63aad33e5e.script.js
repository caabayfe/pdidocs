/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
      if(api.item && api.item.value) {
	    return api.item.index == 0 || (api.item.index > 0 && !api.state.quickLinks[api.item.index-1].user);
      }
}
