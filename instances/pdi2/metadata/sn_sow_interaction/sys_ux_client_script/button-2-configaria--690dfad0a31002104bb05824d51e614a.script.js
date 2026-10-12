/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const contactLabel = helpers.translateSync('Contact');

    const firstName = api.data.lp_record.result.first_name.displayValue;
    
    const ariaLabel = firstName ? helpers.translateSync("{0}'s contact info", firstName) : contactLabel;

    return { 
        "aria-label": ariaLabel
    };
}
