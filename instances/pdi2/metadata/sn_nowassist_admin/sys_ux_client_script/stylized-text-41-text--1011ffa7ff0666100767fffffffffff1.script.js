/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
async function evaluateProperty({api, helpers}) {
	 var text = (api.state.faqSearchTerm?.length>0 || api.state.selectedFaqFeature != ['all']) ? 'Showing results' : 'All';
  return await helpers.translateSync(text);;
}
