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
    helpers.screen.updateStatus({
        title: await helpers.translate('Set objectives')
    });
  
    api.setState('userWelcomeMsg', await helpers.translate(`Welcome {0}`, api.context.session.user.firstName));
}
