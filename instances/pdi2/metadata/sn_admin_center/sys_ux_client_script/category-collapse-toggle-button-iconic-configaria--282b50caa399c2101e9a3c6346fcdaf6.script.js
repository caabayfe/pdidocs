/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	 let isCollapsed = true;
    if (api.state.categoryCollapseStatus) {
        let collapseStatus = JSON.parse(api.state.categoryCollapseStatus);
        isCollapsed = collapseStatus[api.item.value.maturity];
    }

    let ariaLabelMsg = isCollapsed ? api.state.expandMessage : api.state.collapseMessage;
    return {
        "button": {
            "aria-label": `${api.item.value.maturity} accordion`,
            "aria-expanded": `${!isCollapsed}`,

        }
    };
}
