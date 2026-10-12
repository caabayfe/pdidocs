/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.props.experienceProperties.environment.value === 'production' || api.state.upgradeSessionType === 'bulk_app_update';
}
