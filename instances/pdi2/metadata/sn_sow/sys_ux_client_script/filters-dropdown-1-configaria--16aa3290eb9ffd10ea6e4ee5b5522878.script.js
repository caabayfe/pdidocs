/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {label} = api.state.selectedFilterItem;
	return {
    "trigger": {
      "aria-label": helpers.translateSync("Selected filter: {0}", label)
    }
  };
}
