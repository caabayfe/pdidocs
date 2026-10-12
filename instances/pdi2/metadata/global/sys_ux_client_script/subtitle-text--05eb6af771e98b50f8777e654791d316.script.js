/**
 * Subtitle text for the EF Error Card List component (88ed60bd). Returns the app-provided
 * `refinedCodeDescription` prop when set, otherwise the translated built-in description.
 *
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    return api.context.props.refinedCodeDescription ||
        helpers.translateSync('Refined code is a unique code assigned to every actionable log. The refined code recommends the appropriate remediation at the correct level of granularity.');
}
