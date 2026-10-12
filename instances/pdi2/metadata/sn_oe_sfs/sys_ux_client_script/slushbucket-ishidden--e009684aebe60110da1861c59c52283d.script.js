/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    try {
        return !api.data.ci_record_slushbucket.output.slushbucket ||
            !api.state.isValidRecord ||
            api.state.hideAllCustomFields ||
            api.state.hideOnLoadCustomFields.slushbucket;
    } catch (e) {
        return true;
    }
}
