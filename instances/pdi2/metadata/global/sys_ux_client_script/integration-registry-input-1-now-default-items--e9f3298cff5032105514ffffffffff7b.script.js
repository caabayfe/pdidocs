/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var result = [];
  if (!api.data)
    return result;

  if (!api.data.get_existing_provider_names.output)
    return result;

  var providers = api.data.get_existing_provider_names.output.data.GlideAggregate_Query;
  for (var i = 0; i < providers.length; i++) {
    result.push({
      id: "entry_" + i,
      label: providers[i].groupBy[0].displayValue
    });
  }

  return result;
}
