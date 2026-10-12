/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    helpers.screen.updateStatus({title: 'Home'});
    const name = api.context.session.user.firstName || api.context.session.user.fullName;
    api.setState('viewAll', await helpers.translate("View all"));
    api.setState('closeButtonTranslatedAriaLabel', await helpers.translate("Close So glad you've landed here, {0} header", name));

    return api.setState('headerText', await helpers.translate("So glad you've landed here, {0}", name));
}
