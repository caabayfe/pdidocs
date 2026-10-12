/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if (api.state.loading)
        return null; // for indeterminate loading.
    return 0; // force it to zero to hide it.
}
