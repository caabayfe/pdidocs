/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.state.isEditing){
    return api.state.projectDetails.status;
  }else{
    return 'DRAFT';
  }
}
