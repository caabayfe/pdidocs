/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const selectionProps = api?.data?.list?.selectionProps;
  const paginationProps = api?.data?.list?.paginationProps;
  const recordDisplayValue = api?.data?.glide_form_1?.nowRecordCommonHeader?.recordDisplayValue || '';
  const {
    allRowsSelected,
    exceptedRowIds,
    selectedRowIds
  } = selectionProps;
  const {
    totalRecordCount
  } = paginationProps;

  const recordCount = allRowsSelected ? totalRecordCount - exceptedRowIds.length : selectedRowIds.length;
  if (recordCount == 0) {
    return helpers.translateSync('Select records to review');
  } else if (recordCount > 1) {
    return helpers.translateSync('Multiple records ({0})', recordCount);
  } else {
    return recordDisplayValue;
  }
}
