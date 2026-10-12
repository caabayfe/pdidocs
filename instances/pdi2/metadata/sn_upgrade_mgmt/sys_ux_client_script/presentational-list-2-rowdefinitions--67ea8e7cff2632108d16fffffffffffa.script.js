/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    const startIndex = (api.state.gcpage ) * api.state.gcoffset;
    return {
      customCellEmittedActions: api.state.gcRowData.customCellEmittedActions,
      rows: api.state.gcRowData.rows.slice(startIndex, startIndex + api.state.gcoffset)
    };
}
