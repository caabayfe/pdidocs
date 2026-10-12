/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    api.setState('saveSetup', true);
    // Save the actual setup after fetching the latest domain from platform, without reload cases need this.
    api.data.get_user_domain_1.refresh();

}
