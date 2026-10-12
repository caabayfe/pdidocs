/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('Grouping was automatically turned on for {0}, as defined in the',api.state.activityForm.fields.relation.label);
}
