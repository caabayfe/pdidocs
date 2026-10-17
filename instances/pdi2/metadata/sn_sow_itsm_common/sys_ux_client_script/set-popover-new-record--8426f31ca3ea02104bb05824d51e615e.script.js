/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    if (event.elementId == 'preview_new_record') {
        api.setState("popoverPayload", {
            table: 'sys_user',
            sysId: api.context.props.userSysId
        });
        api.setState('hideFormPopover', false);
        api.emit('MACROPONENT_POPOVER_OPEN_REQUESTED', {
            popoverElementId: "[component-id$='display_form_popover']",
            popoverTargetElementId: 'preview_new_record',
            popoverTriggerElement: null
        });
    }
}
