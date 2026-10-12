/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const skillConfig = api.context.props.payload.guided_context.skill_config;
	return `Is ${skillConfig} available in Now Assist panel?`;
}
