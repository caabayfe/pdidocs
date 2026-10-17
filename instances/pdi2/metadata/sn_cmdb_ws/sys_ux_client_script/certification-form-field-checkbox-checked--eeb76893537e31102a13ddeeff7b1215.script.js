/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {
    name
  } = api.item.value;
  const {
    attributeCheckedState
  } = api.state;
	return attributeCheckedState.hasOwnProperty(name) && attributeCheckedState[name];
}
