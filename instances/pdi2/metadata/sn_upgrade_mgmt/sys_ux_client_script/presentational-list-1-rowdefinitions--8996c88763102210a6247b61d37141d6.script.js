/**
* @param {params} params
* @param {api} params.api
* @param {TransformApiHelpers} params.helpers
*/
function evaluateProperty({
    api,
    helpers
}) {
    const startIndex = (api.state.page ) * api.state.offset;
    return {
      customCellEmittedActions: api.state.rowData.customCellEmittedActions,
      rows: api.state.rowData.rows?.slice(startIndex, startIndex + api.state.offset).map(row => {return {...row, selectionDisabled: api.state.performingAction || api.state.isProcessing}})
    };
}
