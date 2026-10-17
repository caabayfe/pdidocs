/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // OOB + Custom policies both will have "Any checkboxes" now
  const isChecked = api?.item?.value?.is_check_box_checked;
  return isChecked;
}
