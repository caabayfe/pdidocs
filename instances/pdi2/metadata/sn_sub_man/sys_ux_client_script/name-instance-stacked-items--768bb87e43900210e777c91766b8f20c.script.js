/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.get_customer_account_details_1.output) {
        return [{
            "label": helpers.translateSync("Account name"),
            "value": {
                "type": "string",
                "value": api.data.get_customer_account_details_1.output.accountName
            }
        }, {
            "label": helpers.translateSync("Current instance"),
            "value": {
                "type": "string",
                "value": api.data.get_customer_account_details_1.output.instanceName
            }

        }];
    }
}
