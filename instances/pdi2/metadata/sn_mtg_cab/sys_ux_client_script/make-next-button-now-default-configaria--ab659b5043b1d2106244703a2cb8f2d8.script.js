/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const taskNumber = api.context.props.agendaItemRecordData.task.record.number.display_value;
	return {
    "aria-label": helpers.translateSync("Make next agenda item - {0}", taskNumber)
  };
}
