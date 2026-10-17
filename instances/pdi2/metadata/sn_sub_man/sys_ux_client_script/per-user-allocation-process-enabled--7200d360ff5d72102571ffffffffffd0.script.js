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
    const output = api.data.lookup_system_property_per_user_allocation_process_enabled.output;
    if (!output) {
        api.setState('per_user_allocation_process_enabled', false);
        return;
    }
    const props = output.properties;

    const isUnconfirmedFlagEnabled = props["sn_sub_man.unconfirmed_user_flow_enabled"] === "true";
    const isPerUserAllocationDisplayEnabled = props["sn_sub_man.per_user_allocation_info_display_enabled"] === "true";
    const isPerUserAllocationProcessEnabled = props["sn_sub_man.per_user_allocation_process_enabled"] === "true";

    const isEnabled = isUnconfirmedFlagEnabled ||
        isPerUserAllocationDisplayEnabled ||
        isPerUserAllocationProcessEnabled;
    api.setState('per_user_allocation_process_enabled', isEnabled);
}
