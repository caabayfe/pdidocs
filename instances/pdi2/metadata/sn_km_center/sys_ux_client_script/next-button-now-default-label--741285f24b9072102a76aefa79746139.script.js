/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // TODO: Use this line when helpers.translateSync supports object parameter
	//return helpers.translateSync({code: 'knowledge-center', message: 'Next', comment: 'Next button that continues to the creation of a new knowledge article'}) 
  return helpers.translateSync("Next{knowledgecentershim}");
}
