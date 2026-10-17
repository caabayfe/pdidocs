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
    const {
        modal
    } = helpers;
    const wrappedAction = event.payload.wrappedAction;
    if (wrappedAction === "SN_CATALOG_BUILDER#NEW_UI_POLICY_CLICKED") {
        api.setState('uiPolicyId', null);
        modal.open('[component-id$="ui_policy_wizard_model"]');
    } else if (wrappedAction === "SN_CATALOG_BUILDER#UI_POLICY_EDITED") {
        if (api.state.selectedRecords.count === 1) {
            const id = api.state.selectedRecords.sysIds[0];
            api.setState('uiPolicyId', id);
        }
        modal.open('[component-id$="ui_policy_wizard_model"]');
    } else if (wrappedAction === "SN_CATALOG_BUILDER#UI_POLICY_DELETED") {
        modal.open('[component-id$="confirm_and_delete_ui_ppolicy"]');
    }

}
