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
    
    const micClient = imports["global.MICClient"](api, helpers);

    const pageCtrl = imports["global.MICListPageController"](api, helpers, {
        route: "inactive-accounts",
        category: 'dormant',
        disabled: !micClient.isDormantCategoryEnabled()
    });

    pageCtrl.addHandler("PAGE_READY", () => {
        pageCtrl.updateHeader({
            title: helpers.translate("Accounts with no login for 100 days"),
            subTitle: helpers.translate("Not available (Days since last API accessed): This denotes that the machine identity account has not made any call since the plugin installation date OR have not made a call for 180 days or more.")
        });
    });

    pageCtrl.addHandler("NOW_LIST#CELL_LINK_CLICKED", (event) => pageCtrl.navigateToDetailPage(event.payload.cell.metadata.openRecordMetadata.sysId));

    pageCtrl.handle(event);
}
