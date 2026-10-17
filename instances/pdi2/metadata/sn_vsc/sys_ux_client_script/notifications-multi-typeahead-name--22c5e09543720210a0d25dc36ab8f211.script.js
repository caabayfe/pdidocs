/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // This name object/field can be used during user interactions within typeahead component, gets thrown as a payload and becomes easier to act accordingly.
  var typeAheadName = api?.item?.value?.model_id + "," + api?.item?.value?.column_name + "," + api?.item?.value?.source_table + "," + api?.item?.value?.typeaheadSourceTable;
  /**
  * (As there could be a lot of scenarios of adding/removing notifications)
  * This needs to go in for the newly added notifications from the dropdown, so we can send accross in the payload.
  */
  if (api?.item?.new_notification) {
    typeAheadName += api?.item?.new_notification;
  }
  return typeAheadName;
}
