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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    const eventPayload = event.payload;
    api.setState('disableCloneScheduleStartTime',true);
    api.setState('cloneStartTimeTooltip',false);
    api.setState('estimatedStartDateTime','');
    api.setState('showEstimatedDuration',false);
    api.setState('estimatedCloneEndTime','');
    api.setState('estimatedCompletionMessage','');
    api.setState('showEstimatedCompletionTime',false);
    api.setState("targetInstanceId", eventPayload.value);
    api.setState("disableContinuebutton",true);
    if (eventPayload.item.id === "target_instance") {
        api.setState('oauthAddInstance',true);
        helpers.modal.open("register_instance"/*add_target_instance_modal*/);
    } 
    else {
        eventHandler.changeTargetInstance(eventPayload.value, eventPayload.item.label, eventPayload.item.instanceUrl);
    }
}
