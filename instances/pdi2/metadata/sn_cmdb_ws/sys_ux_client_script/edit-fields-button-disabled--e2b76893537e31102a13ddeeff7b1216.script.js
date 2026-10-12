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
      isTaskClosed,
      allowFieldUpdates,
      canWrite
    }
  } = api.data.cert;
  const {
    attributeCheckedState
  } = api.state;
	return isTaskClosed || !canWrite || !allowFieldUpdates || Object.keys(attributeCheckedState).some(key => attributeCheckedState[key]) || !selectedRowIds.length || allRowsSelected;
}
