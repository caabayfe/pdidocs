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
    if (event.elementId == 'preview_caller' || event.elementId == 'preview_caller_tier_1') {
        api.setState("popoverPayload", {
            "table": 'sys_user',
            "sysId": api.data.record_information.output.sourceInfo.callerInfo.caller.sysId
        });
        api.setState('hideFormPopover', false);
        api.emit('MACROPONENT_POPOVER_OPEN_REQUESTED', {
            popoverElementId: "[component-id$='display_form_popover']",
            popoverTargetElementId: event.elementId,
            popoverTriggerElement: null
        });
    }

}
