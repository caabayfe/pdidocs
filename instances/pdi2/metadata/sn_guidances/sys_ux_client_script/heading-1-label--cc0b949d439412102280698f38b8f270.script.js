/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.isWorkNoteExperience)
	  return helpers.translateSync('Compose a work note (private)');
  else
    return helpers.translateSync('Compose a comment');
}
