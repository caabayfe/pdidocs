 /**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const certificationFields = api?.data?.cert?.taskData?.certificationFields;
  const {
    attributeCheckedState
  } = api.state;

  if (!certificationFields)
    return false;
  
  const attributeKeys = Object.keys(attributeCheckedState);
  if (attributeKeys.length < certificationFields.split(',').length)
    return false;
  return !attributeKeys.some(key => !attributeCheckedState[key]);
}
