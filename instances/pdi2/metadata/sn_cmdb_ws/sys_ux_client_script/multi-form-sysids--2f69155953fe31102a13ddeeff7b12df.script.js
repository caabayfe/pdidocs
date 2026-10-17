/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {
    selectedRowIds
  } = api.data.list.selectionProps;

  return selectedRowIds.join(',');
}
