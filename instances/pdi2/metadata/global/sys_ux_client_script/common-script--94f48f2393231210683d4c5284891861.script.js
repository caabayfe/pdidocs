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
    const controller = imports["global.MICDetailPageController"](api, helpers, {
        DATA_BROKER_ACTION: "getWsaFalseDetail",
        LIST_NAME: "wsa-false",
        GET_LABELS_AND_VALUES: getLabelsAndValues
    });

    function getLabelsAndValues(data) {
        const labels = [
            helpers.translate("Web service access only"),
            helpers.translate("Last API access time"),
            helpers.translate("Last API accessed")
        ];
        const values = [
            data.webServiceAccessOnly,
            data.lastApiAccessedTime,
            data.lastApiAccessed
        ];
        return [labels, values, data];
    }
    
    controller.handle(event);
}
