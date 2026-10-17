/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.isWorkNoteExperience)
	  return 'yellow';
  else
    return 'initial';
}
