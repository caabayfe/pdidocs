/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (api.state.serialNumber) {
        var paramsJSON = {};
        paramsJSON.asset_tag = api.state.assetTag;
        paramsJSON.serial_number = api.state.serialNumber;
        paramsJSON.reserved_for = api.state.reservedFor;
        api.setState('paramsJSON',paramsJSON);
    } else {
        helpers.translate("Please enter serial number").then(
            (value) => {
                api.setState('errorMessage', value);
            }
        );
    }
}
