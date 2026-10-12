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
        route: 'wsa-false',
        category: 'wsa_false'
    });

    pageCtrl.addHandler("PAGE_READY", () => pageCtrl.updateHeader({
        title: helpers.translate('Web Service Access set to false'),
        subTitle: helpers.translate('Any changes made to the record are immediately updated in the list, risk score resulting from those changes will be reflected the following day.')
    }));

    pageCtrl.handle(event);
}
