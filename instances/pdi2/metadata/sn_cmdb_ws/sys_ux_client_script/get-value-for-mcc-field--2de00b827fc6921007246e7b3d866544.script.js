/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var value = null;
  let fields = api.state.userPayload.attributes[api.item?.parent?.parent?.value?.table]?.fields;
  if (Array.isArray(fields)) {
    fields = fields[api.item.parent.index];
  }

  if (Object.keys(fields).length == 0 || !fields.hasOwnProperty(api.item.value.element) )
    return value;

  return {
    value: fields[api.item.value?.element]?.value || null,
    displayValue: fields[api.item.value?.element]?.displayValue || null
  };
}
