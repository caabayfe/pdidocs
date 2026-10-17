/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // These are the record pages for which the recommended actions sub tab should be shown.
    switch (api.context.props.contextTable) {
        case 'incident':
            return false;
        case 'problem':
            return false;
    }
    return true;
}
