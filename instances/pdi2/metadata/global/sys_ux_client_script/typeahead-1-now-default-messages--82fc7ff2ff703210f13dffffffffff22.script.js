/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.data.get_oauth_entity_record.output==undefined || api.data.get_oauth_entity_record.output.integration_registry_input)
    return [];

  return [
    {
      content: api.state.translatedMessaged["providerRequired"],
      status: "warning",
      icon: "circle-info-outline"
    }
  ];
}
