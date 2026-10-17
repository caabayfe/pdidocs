/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    const data = api.data.hosted_mid_servers_look_up;

    const midSysIds = data.results
        .filter(result => result.mid && result.mid.value)
        .map(result => result.mid.value);

    const midNames = data.results
        .filter(result => result.mid && result.mid.displayValue)
        .map(result => result.mid.displayValue);

    // Set comma-separated list for query
    api.setState('hostedMIDsList',midSysIds.join(','));

    // Set JSON object for transform script
    api.setState('hostedMidNames', {
        hostedMidNames: midNames
    });
}
