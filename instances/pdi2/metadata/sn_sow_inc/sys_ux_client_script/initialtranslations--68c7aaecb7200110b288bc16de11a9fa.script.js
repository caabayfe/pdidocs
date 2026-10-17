/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const userGreeting = await helpers.translate('Hello {0}!', api.context.session.user.firstName);
    api.setState('userGreeting', userGreeting);
}
