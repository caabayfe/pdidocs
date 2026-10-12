/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const startIndex = (api.state.dependenciespage ) * api.state.dependenciesoffset;
    return {
      rows: api.state.dependenciesTableRows?.slice(startIndex, startIndex + api.state.dependenciesoffset)
    .map(row => ({
        ...row
    }))
    };
}
