/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    return {
        'button': {
            'aria-label': helpers.translateSync('Link to {0}', api.item.value.headingName)
        }
    };
}
