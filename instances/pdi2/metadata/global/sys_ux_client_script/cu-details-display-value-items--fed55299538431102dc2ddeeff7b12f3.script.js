/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var secondaryItems = api?.data?.cu_details_form?.form?.header?.secondaryItems;
  var transformedSecondaryItems = api?.data?.cu_details_form?.form?.header?.transformedSecondaryItems;
  if (!transformedSecondaryItems || transformedSecondaryItems.length == 0) {
    return '[{"label":"","value":""}]';
  }
  for (var i = 0 ; i < transformedSecondaryItems.length; i++) {
    if (transformedSecondaryItems[i].value.type == 'highlighted-value') {
      transformedSecondaryItems[i].value.variant = 'primary';
    } else if (secondaryItems[i].fieldName == 'sys_created_on') {
      transformedSecondaryItems[i].value.value = transformedSecondaryItems[i].value.value.split(' ')[0];
    }
  }
	return transformedSecondaryItems;
}
