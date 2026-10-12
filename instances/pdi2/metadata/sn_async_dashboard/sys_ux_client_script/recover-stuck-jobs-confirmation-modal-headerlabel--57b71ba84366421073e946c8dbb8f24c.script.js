/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var selectionCount = api.state.selectionCount;
  if (selectionCount > 1) {
    return 'Recover these ' + selectionCount + ' jobs?';
  } else {
    return 'Recover 1 job?';
  }
}
