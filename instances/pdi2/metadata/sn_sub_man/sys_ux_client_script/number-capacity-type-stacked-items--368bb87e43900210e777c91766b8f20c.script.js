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
        return [
         , {
            "value": {
                "color": api.data.get_customer_account_details_1.output.capacityType === 'Shared capacity type' ? 'purple' : 'teal',
                "label": api.data.get_customer_account_details_1.output.capacityType,
                "type": "highlighted-value",
                "variant": "secondary"
            }
        }];
    }
}
