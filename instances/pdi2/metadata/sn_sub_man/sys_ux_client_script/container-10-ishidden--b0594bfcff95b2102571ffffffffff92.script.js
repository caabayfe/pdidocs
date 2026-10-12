/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return (api.data.sub_ent_record.result.subscription_type.value == 0) && (!api.state.per_user_allocation_process_enabled);
}
