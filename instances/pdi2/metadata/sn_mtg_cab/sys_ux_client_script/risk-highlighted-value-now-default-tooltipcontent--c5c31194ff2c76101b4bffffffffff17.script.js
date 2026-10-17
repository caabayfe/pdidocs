/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('Risk: {0}', api.context.props.agendaItemRecordData.task.record.risk.display_value);
}
