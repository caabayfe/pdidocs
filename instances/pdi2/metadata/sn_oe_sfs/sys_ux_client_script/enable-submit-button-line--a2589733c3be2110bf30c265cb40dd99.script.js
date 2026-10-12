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
    } else if (isEmpty(api.state.line_hash_secret) || isEmpty(api.state.line_access_token) || isEmpty(api.state.line_bot_name)) {
        api.setState('buttonDisabled', true);
    } else {
        if (api.state.line_hash_secret != api.data.fetchlinebotdetails_1.output.bot_info.hash_secret || api.state.line_access_token != api.data.fetchlinebotdetails_1.output.bot_info.token || api.state.line_bot_name != api.data.fetchlinebotdetails_1.output.bot_info.bot_name) {
            api.setState('buttonDisabled', false);
        } else {
            api.setState('buttonDisabled', true);
        }

    }

    function isEmpty(str) {
        return str === undefined || str === null || str.match(/^ *$/) !== null ;
    }
}
