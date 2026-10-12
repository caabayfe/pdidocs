/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Base URL for Access Analyzer
    let baseUrlForHref = "now/access-management";
    const bcItems = [];
    // URL for the Overview page
    bcItems.push({
        "label": helpers.translateSync("Overview"),
        "href": baseUrlForHref + "/overview",
        "hideLabel": false
    });
    bcItems.push({
        "label": helpers.translateSync("Access analyzer"),
        "href": baseUrlForHref+ "/access-analyzer",
        "hideLabel": false
    });

    const viewType = api?.context?.props?.viewType;
    /**
     * If traditional view, let it read from the result title.
     * Otherwise, the title should be the name of the consumer for example: AI Agent Name/Workflow name
     * Click handlers stay as they are
     *  */
    // Base URL for the Results page
    const resultsBaseUrlForHref = baseUrlForHref + "/results/" + requestId;
    if (!viewType) {
        bcItems.push({
            "label": helpers.translateSync(api.state.resultTitle),
            "href": resultsBaseUrlForHref,
            "hideLabel": false
        });
    } else {
        // Grab the parent name of the resource type selected, comes handy for non-traditional consumers
        const parent_name = api?.data?.get_header_data?.output?.parent_name;
        const href = resultsBaseUrlForHref + "/params/viewType/" + viewType;
        bcItems.push({
            "label": helpers.translateSync("Permissions for " + parent_name),
            "href": href,
            "hideLabel": false
        });
    }
    return bcItems;
}
