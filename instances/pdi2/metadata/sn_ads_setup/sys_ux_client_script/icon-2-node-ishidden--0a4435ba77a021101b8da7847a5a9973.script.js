/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {

    if (api.state.returningUser && api.state.setupStatus.type === 'basic' && api.state.setupStatus.timeStamp) return false;
    return true;
}
