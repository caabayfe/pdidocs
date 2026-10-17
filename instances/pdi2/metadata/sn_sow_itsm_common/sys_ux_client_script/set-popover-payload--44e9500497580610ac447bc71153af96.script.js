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
    api.setState("popoverPayload", {
        "table": api.state.referenceTable,
        "sysId": api.state.referenceSysid,
        "hasReadAccess": api.data.check_read_access_on_record_1.output
    });
    api.setState('hideFormPopover',false);
    api.emit('MACROPONENT_POPOVER_OPEN_REQUESTED', {
        popoverElementId: "[component-id$='custom_popover_1']",
        popoverTargetElementId: api.state.popoverId,
        popoverTriggerElement: null
    });
}
