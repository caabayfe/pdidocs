/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if (!api.item.value.onCallData || !api.item.value.onCallData.primary)
        return [];

    return [{
        "label": "Primary",
        "value": {
            "type": "string",
            "value": api.item.value.onCallData.primary.name
        }
    }];
}
