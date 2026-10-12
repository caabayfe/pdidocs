/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    let ariaLabel = helpers.translateSync("Remine Project");

    if (api.state.projectData.ismining) {
        ariaLabel = helpers.translateSync("View Progress");
    } else if (api.state.projectData?.miningState?.value == "NEW") {
        ariaLabel = helpers.translateSync("Mine Project");
    }

    return {
        "button": {
            "aria-label": ariaLabel,
        }
    };
}
