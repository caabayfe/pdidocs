/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let sectionLabel = "";
    if (api.item.value.expanded) {
        switch (api.item.value.callLabel) {
            case "active":
                sectionLabel = helpers.translateSync("Collapse active participants list");
                break;
            case "pending":
                sectionLabel = helpers.translateSync("Collapse pending participants list");
                break;
            case "completed":
                sectionLabel = helpers.translateSync("Collapse completed participants list");
                break;
        }
    } else {
        switch (api.item.value.callLabel) {
            case "active":
                sectionLabel = helpers.translateSync("Expand active participants list");
                break;
            case "pending":
                sectionLabel = helpers.translateSync("Expand pending participants list");
                break;
            case "completed":
                sectionLabel = helpers.translateSync("Expand completed participants list");
                break;
        }
    }
    return {
        "button": {
            "aria-label": sectionLabel
        }
    };
}
