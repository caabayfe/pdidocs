/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.templatePublished){
    return helpers.translateSync('Published template is not editable. Unpublish it to edit.');
  }else{
	return helpers.translateSync('Edit template');
  }
}
