/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    return [{
        label: helpers.translateSync("Manager"),
        value: api.item.value.manager.displayValue
    }];
}
