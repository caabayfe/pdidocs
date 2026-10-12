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

    const pageCtrl = imports["global.MICListPageController"](api, helpers, {
        route: 'basic-auth',
        category: 'basic_auth'
    });

    pageCtrl.addHandler("PAGE_READY", () => pageCtrl.updateHeader({
        title: helpers.translate("Accounts using Basic Authentication")
    }));

    pageCtrl.handle(event);
}
