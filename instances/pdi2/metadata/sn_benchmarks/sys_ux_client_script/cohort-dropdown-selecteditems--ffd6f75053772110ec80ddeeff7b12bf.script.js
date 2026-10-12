/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var items = [];
    if (api.state.selectedCohortID)
        items.push(api.state.selectedCohortID);
    else
        items.push(
           'all'
        );
    return items;
}
