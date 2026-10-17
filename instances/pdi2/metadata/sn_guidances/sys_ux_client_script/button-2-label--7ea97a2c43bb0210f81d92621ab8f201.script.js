/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.isWorkNoteExperience)
	  return helpers.translateSync('Post work notes (private)');
  else
    return helpers.translateSync('Post comments');
}
