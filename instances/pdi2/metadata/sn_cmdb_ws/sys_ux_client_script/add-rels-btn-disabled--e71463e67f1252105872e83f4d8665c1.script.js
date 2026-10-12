/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const selectionProps = api?.data?.list_controller?.selectionProps;
  return !(selectionProps?.allRowsSelected || selectionProps?.selectedRowIds?.length > 0);
}
