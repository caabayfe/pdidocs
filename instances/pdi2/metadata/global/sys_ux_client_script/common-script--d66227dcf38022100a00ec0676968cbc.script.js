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
    const controller = imports["global.MICDetailPageController"](api, helpers, {
        DATA_BROKER_ACTION: "getInactiveAccountDetail",
        LIST_NAME: "inactive-accounts",
        GET_LABELS_AND_VALUES: getLabelsAndValues,
        DISABLED: !micClient.isDormantCategoryEnabled()
    });

    function getLabelsAndValues(data) {
        const labels = [
            helpers.translate("Active"),
            helpers.translate("Last API access time"),
            helpers.translate("Days since last API accessed"),
            helpers.translate("Created Date")
        ];
        const values = [
            data.active,
            data.lastApiAccessedTime,
            data.daysSinceLastApiAccess,
            data.createdDate
        ];
        return [labels, values, data];
    }
    
    controller.handle(event);
}
