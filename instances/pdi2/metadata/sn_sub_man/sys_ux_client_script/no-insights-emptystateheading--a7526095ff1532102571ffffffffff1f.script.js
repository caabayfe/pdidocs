/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.sub_ent_record.result == null) return helpers.translateSync("You don't have any insights.");
    const subscriptionType = api.data.sub_ent_record.result.subscription_type.displayValue;
    switch (subscriptionType.toLowerCase()) {
        case 'per-user':
            if (api.state.isMeterTypeCreator && !api.state.unconfirmed_user_flow_enabled) {
                return helpers.translateSync("You don't have any insights.");
            }
            return helpers.translateSync("You don't have any new insights.");
        default:
            return helpers.translateSync("You don't have any insights.");
    }
}
