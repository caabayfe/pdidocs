/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
        label: helpers.translateSync("Application"),
        value: {
            type: "string",
            value: api.data.rule_management_dmc.tableScope.name
        }
    }];
}
