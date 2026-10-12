/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const viewAllAssets = helpers.translateSync('View All Assets');

    const firstName = api.data.lp_record.result.first_name.displayValue;

    const ariaLabel = firstName ? helpers.translateSync("View {0}'s assets in Related Records", firstName) : viewAllAssets;

    return { 
        "aria-label": ariaLabel
    };
}
