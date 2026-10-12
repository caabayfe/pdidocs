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
        route: 'ui-logins-with-integration',
        category: "ui_login_and_integration"
    });

    pageCtrl.addHandler('PAGE_READY', () => pageCtrl.updateHeader({
        title: helpers.translate("UI logins with integration")
    }));

    pageCtrl.handle(event);

}
