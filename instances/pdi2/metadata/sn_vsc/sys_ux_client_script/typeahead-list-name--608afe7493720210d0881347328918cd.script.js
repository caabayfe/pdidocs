/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // This name object/field can be used during user interactions within typeahead component, gets thrown as a payload and becomes easier to act accordingly.
  const typeAheadName = api?.item?.value?.model_id + "," + api?.item?.value?.column_name + "," + api?.item?.value?.source_table + "," + api?.item?.value?.typeaheadSourceTable;
  return typeAheadName;
}
