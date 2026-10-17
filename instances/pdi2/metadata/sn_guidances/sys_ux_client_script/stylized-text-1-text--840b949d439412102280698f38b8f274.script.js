/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.isWorkNoteExperience)
	  return helpers.translateSync('Only your teammates can see this work note');
  else
    return helpers.translateSync('Everyone can see this comment');
}
