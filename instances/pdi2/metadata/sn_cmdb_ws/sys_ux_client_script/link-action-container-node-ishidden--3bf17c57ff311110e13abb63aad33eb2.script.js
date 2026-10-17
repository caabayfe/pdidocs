/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.item && api.item.value)
	  return !api.state.quickLinksEditMode || api.state.quickLinksEditContainerIsOpened || !api.item.value.user;
}
