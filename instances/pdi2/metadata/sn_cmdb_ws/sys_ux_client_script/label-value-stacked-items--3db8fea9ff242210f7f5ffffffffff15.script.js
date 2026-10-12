/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let result = api.item.value?.fields?.map(field => {
    const {label, value} = api.context.props.fields?.[field]?.labelValueObj || {};
    return {
      label,
      value
    };
  });
  return result;
}
