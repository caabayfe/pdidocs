/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const viewAllInteractions = helpers.translateSync('View All Interactions');

    const firstName = api.data.lp_record.result.first_name.displayValue;

    const ariaLabel = firstName ? helpers.translateSync("View all of {0}'s interactions", firstName) : viewAllInteractions;

    return { 
        "aria-label": ariaLabel
    };
}
