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
    var payload={};
    var filterConfigurations = "";
    var deploymentChannels = api.state.deploymentChannels;
   
    if (event.elementId == 'checkbox_va') {
        var selectedVA = event.payload.name;
        var isActive = event.payload.value;
        for (var i = 0; i < deploymentChannels.length; i++) {
            if (deploymentChannels[i].sysId === selectedVA) {
                deploymentChannels[i].isActive = isActive;
                break; 
            }
        }
        
    }
    else if (event.elementId === 'checkbox_2') {
        api.setState('selectAll', event.payload.value);
        for (var i = 0; i < deploymentChannels.length; i++) {
                deploymentChannels[i].isActive = event.payload.value;
        }
    }
    api.setState('deploymentChannels',deploymentChannels);
    

    payload = {
            name: 'applicability',
            validation: 'success',
            action_type: 'update',
            data: deploymentChannels,
            filterId: api.state.filterId,
            skipServerCall: false
        };
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'ACE_GUIDEDX_ITEM_UPDATED',
        eventPayload: payload
    });
}
