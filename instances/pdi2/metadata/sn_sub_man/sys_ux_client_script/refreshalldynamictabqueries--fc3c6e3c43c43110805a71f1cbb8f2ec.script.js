/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // explicitly calling all dynamic Tabs data resources to refresh
    api.data.has_bundled_Items.refresh();
    api.data.has_custom_tables.refresh();
    api.data.has_associated_roles.refresh();
    api.data.has_entitlements.refresh();
    api.data.has_ih_spoke.refresh();
    api.data.has_ih_spoke_caller_spoke.refresh();
    api.data.has_ih_protocol.refresh();
    api.data.has_subscription_unit_ratio.refresh();
    api.data.has_subscription_line_items.refresh();
    api.data.has_wdf_meter_ratio.refresh();
}
