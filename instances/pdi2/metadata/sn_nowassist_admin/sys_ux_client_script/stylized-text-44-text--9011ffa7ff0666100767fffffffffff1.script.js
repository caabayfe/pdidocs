/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return (api.state.faqSearchTerm?.length>0 || api.state.selectedFaqFeature[0] !="all")? 'No result found': 'No Faq Present' ;
}
