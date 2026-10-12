/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const selectionProps = api?.data?.list_controller?.selectionProps;
  const paginationProps = api?.data?.list_controller?.paginationProps;
  if (!Object.keys(selectionProps).length || !Object.keys(paginationProps).length)
    return helpers.translateSync('Review records');
  const {
    allRowsSelected,
    exceptedRowIds,
    selectedRowIds
  } = selectionProps;
  const {
    totalRecordCount
  } = paginationProps;

  const recordCount = allRowsSelected ? totalRecordCount - exceptedRowIds.length : selectedRowIds.length;
  if (recordCount) {
    return helpers.translateSync('Review records ({0})', recordCount);
  } else {
    return helpers.translateSync('Review records');
  }
}
