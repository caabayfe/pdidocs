/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {filterCondition} = api.state.selectedFilterItem;
	return {
    "trigger": helpers.translateSync("Selected filter: {0}", filterCondition)
  };
}
