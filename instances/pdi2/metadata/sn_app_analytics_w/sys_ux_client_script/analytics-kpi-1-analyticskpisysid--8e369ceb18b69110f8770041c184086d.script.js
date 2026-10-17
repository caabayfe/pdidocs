/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const KPISysId = api.context.props.sysId;

	return KPISysId.includes('new-kpi') ? '' : KPISysId;
}
