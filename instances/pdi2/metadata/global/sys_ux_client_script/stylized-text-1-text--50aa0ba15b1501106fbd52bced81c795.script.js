/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const data = api.data.translations.output;
    return (data) ? data.activate : 'Activate';
}
