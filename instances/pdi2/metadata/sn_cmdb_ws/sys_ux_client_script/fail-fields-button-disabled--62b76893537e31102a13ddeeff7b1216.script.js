/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {
    allRowsSelected,
    selectedRowIds
  } = api.data.list.selectionProps;
  const {
    taskData: {
      isTaskClosed
    }
  } = api.data.cert;
  const {
    attributeCheckedState
  } = api.state;
	return isTaskClosed || !((allRowsSelected || selectedRowIds.length) && Object.keys(attributeCheckedState).some(key => attributeCheckedState[key]));
}
