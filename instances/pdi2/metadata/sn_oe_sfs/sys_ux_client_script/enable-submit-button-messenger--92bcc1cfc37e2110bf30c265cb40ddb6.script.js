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
    const {
        name,
        fieldValue
    } = event.payload;


    if (!fieldValue) {
        api.setState('buttonDisabled', true);
    } else if (isEmpty(api.state.messenger_hash_secret) || isEmpty(api.state.messenger_access_token)) {
        api.setState('buttonDisabled', true);
    } else {
        if (api.state.messenger_hash_secret != api.data.fetchmessengerbotdetails_1.output.bot_info.hash_secret || api.state.messenger_access_token != api.data.fetchmessengerbotdetails_1.output.bot_info.token) {
            api.setState('buttonDisabled', false);
        } else {
            api.setState('buttonDisabled', true);
        }

    }

    function isEmpty(str) {
        return str === null || str.match(/^ *$/) !== null;
    }
}
