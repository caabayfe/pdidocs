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
        LIST_NAME: "basic-auth",
        GET_LABELS_AND_VALUES: getLabelsAndValues
    });

    function getLabelsAndValues(data) {
        const labels = [
            helpers.translate("Resource"),
            helpers.translate("Method"),
            helpers.translate("Type"),
            helpers.translate("Last API access time")
        ];
        const {resource, method, type} = data.mi_resource._reference;
        const values = [
            resource.displayValue,
            method.displayValue,
            type.displayValue,
            data.last_used.displayValue
        ];
        const {displayValue, value} = data.user._reference.user;
        return [labels, values, {
            userDisplayName: displayValue,
            userSysId: value
        }];
    }

    controller.addHandler("EXECUTE_DATA_BROKER", api.data.get_request_details.refresh);
    controller.addHandler("get_request_details", () => controller.updateDetails(api.data.get_request_details.results[0]));
    controller.handle(event);
}
