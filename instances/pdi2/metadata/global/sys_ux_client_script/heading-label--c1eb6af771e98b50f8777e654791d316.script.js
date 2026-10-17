/**
 * Heading label for the EF Error Card List component (88ed60bd). Returns the app-provided
 * `refinedCodesLabel` prop when set, otherwise the translated built-in heading.
 *
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    return api.context.props.refinedCodesLabel ||
        helpers.translateSync('Refined Codes');
}
