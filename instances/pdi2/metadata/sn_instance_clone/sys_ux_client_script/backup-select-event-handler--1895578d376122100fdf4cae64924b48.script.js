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
    const eventHandlerUtil = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);

    eventHandlerUtil.resetControls();
    api.setState('userHasInteracted', true);
    api.setState('backupTypeFromCloneRequestSelectedItemId', event.payload.item.id);
    api.setState('backupTypeFromCloneRequestSelectedItemLabel', event.payload.item.label);
    api.setState('on_demand_backup', false);
    if (event.payload.item.id == 'use_another_clone_backup') {
        api.setState('cloneRequestSelectionContainerShow', true);
        api.setState('disableContinuebutton', true);
        api.setState('cloneRequestIdSelectedItemId', 'clickToSelectCloneRequest');
    } else {
        if (event.payload.item.id == 'on_demand_backup') {
            api.setState('on_demand_backup',true);
        }
        api.setState('cloneRequestSelectionContainerShow', false);
        api.setState('disableContinuebutton',false);
        api.setState('cloneRequestIdSelectedItemLabel', '');
    }
    eventHandlerUtil.validateCloneRequest({});
    
}
